import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
  ConflictException,
  Logger,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import { addMinutes } from 'date-fns';

import { PrismaService } from '../database/prisma.service';
import { UsersService } from '../users/users.service';
import { EmailService } from '../email/email.service';
import { LoginDto } from './dtos/login.dto';
import { RegisterDto } from './dtos/register.dto';
import { AuthResponseDto, RefreshTokenResponseDto, UserResponseDto } from './dtos/auth-response.dto';
import { CheckEmailResponseDto } from './dtos/check-email.dto';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  private readonly bcryptRounds = 10;

  constructor(
    private readonly prisma: PrismaService,
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly emailService: EmailService,
  ) {}

  async register(registerDto: RegisterDto): Promise<{ message: string }> {
    const existingUser = await this.usersService.findByEmail(registerDto.email);
    if (existingUser) {
      throw new ConflictException('Email already in use');
    }

    const hashedPassword = await bcrypt.hash(registerDto.password, this.bcryptRounds);
    const user = await this.usersService.create({
      email: registerDto.email,
      password: hashedPassword,
      firstName: registerDto.firstName,
      lastName: registerDto.lastName || '',
    });

    // Generate email verification code
    const verificationCode = this.generateEmailVerificationCode();
    await this.prisma.verificationToken.create({
      data: {
        userId: user.id,
        code: verificationCode,
        tokenType: 'EMAIL_VERIFICATION',
        expiresAt: addMinutes(new Date(), 10),
      },
    });

    // Send verification email
    await this.emailService.sendVerificationCode(user.firstName, user.email, verificationCode);

    this.logger.debug(`User registered: ${user.id}`);
    return { message: 'Registration successful. Please check your email to verify your account.' };
  }

  async checkEmail(email: string): Promise<CheckEmailResponseDto> {
    const user = await this.usersService.findByEmail(email);

    if (!user) {
      return { exists: false };
    }

    return {
      exists: true,
      emailVerified: user.emailVerified,
      loginMethods: ['PASSWORD'],
    };
  }

  async login(loginDto: LoginDto, ipAddress?: string): Promise<AuthResponseDto> {
    const user = await this.usersService.findByEmail(loginDto.email);
    if (!user) {
      this.logger.warn(`Failed login attempt for non-existent email: ${loginDto.email}`);
      throw new UnauthorizedException('Invalid credentials');
    }

    if (user.status !== 'ACTIVE') {
      throw new UnauthorizedException(`Account ${user.status.toLowerCase()}`);
    }

    const isPasswordValid = await bcrypt.compare(loginDto.password, user.password);
    if (!isPasswordValid) {
      this.logger.warn(`Failed login attempt for user: ${user.id}`);
      throw new UnauthorizedException('Invalid email or password');
    }

    if (!user.emailVerified) {
      throw new UnauthorizedException('Email not verified');
    }

    // Generate tokens
    const { accessToken, refreshToken, refreshTokenExpiresAt, expiresIn, refreshExpiresIn } = this.generateTokens(user.id, user.email, user.role);

    // Save refresh token to database
    await this.prisma.refreshToken.create({
      data: {
        userId: user.id,
        token: refreshToken,
        expiresAt: refreshTokenExpiresAt,
        ipAddress: ipAddress || null,
      },
    });

    // Update last login
    await this.usersService.update(user.id, {
      lastLoginAt: new Date(),
    });

    this.logger.debug(`User ${user.id} logged in successfully`);

    return {
      accessToken,
      refreshToken,
      expiresIn,
      refreshExpiresIn,
      tokenType: 'Bearer',
      user: this.mapUserToResponse(user),
    };
  }

  async logout(userId: string): Promise<{ success: boolean }> {
    // Revoke all refresh tokens for this user
    await this.prisma.refreshToken.updateMany({
      where: { userId },
      data: { revoked: true },
    });

    this.logger.debug(`User ${userId} logged out successfully`);
    return { success: true };
  }

  async refreshAccessToken(refreshToken: string, ipAddress?: string): Promise<RefreshTokenResponseDto> {
    try {
      // Verify the refresh token JWT
      const payload = this.jwtService.verify(refreshToken, {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
      });

      // Find the refresh token in database
      const storedToken = await this.prisma.refreshToken.findUnique({
        where: { token: refreshToken },
        include: { user: true },
      });

      if (!storedToken || storedToken.revoked) {
        throw new UnauthorizedException('Refresh token is revoked');
      }

      // Check if token is expired
      if (storedToken.expiresAt < new Date()) {
        throw new UnauthorizedException('Refresh token has expired');
      }

      const user = storedToken.user;
      if (!user) {
        throw new UnauthorizedException('User not found');
      }

      // Generate new tokens
      const { accessToken, refreshToken: newRefreshToken, refreshTokenExpiresAt, expiresIn, refreshExpiresIn } = this.generateTokens(
        user.id,
        user.email,
        user.role,
      );

      // Revoke old refresh token
      await this.prisma.refreshToken.update({
        where: { id: storedToken.id },
        data: { revoked: true },
      });

      // Save new refresh token
      await this.prisma.refreshToken.create({
        data: {
          userId: user.id,
          token: newRefreshToken,
          expiresAt: refreshTokenExpiresAt,
          ipAddress: ipAddress || null,
        },
      });

      this.logger.debug(`User ${user.id} refreshed access token`);

      return {
        accessToken,
        refreshToken: newRefreshToken,
        expiresIn,
        refreshExpiresIn,
        tokenType: 'Bearer',
      };
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }

      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.warn(`Failed to refresh token: ${errorMessage}`);
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async forgotPassword(email: string): Promise<{ message: string }> {
    const user = await this.usersService.findByEmail(email);
    if (!user) {
      // Don't reveal if email exists for security
      return { message: 'If the email exists, we sent instructions for password reset.' };
    }

    // Generate password reset token
    const resetToken = uuidv4();

    await this.prisma.passwordResetToken.create({
      data: {
        userId: user.id,
        token: resetToken,
        expiresAt: addMinutes(new Date(), 30),
      },
    });

    // Send password reset email
    const resetLink = `${this.configService.get<string>('FRONTEND_URL')}/reset-password?token=${resetToken}`;
    await this.emailService.resetPassword({
      url: resetLink,
      name: user.firstName,
      email: user.email,
    });

    this.logger.debug(`Password reset requested for user: ${user.id}`);

    return { message: 'If the email exists, we sent instructions for password reset.' };
  }

  async validateResetPasswordToken(token: string): Promise<{ valid: boolean; expiresAt?: string }> {
    try {
      // Find password reset token
      const resetToken = await this.prisma.passwordResetToken.findUnique({
        where: { token },
      });

      if (!resetToken) {
        return { valid: false };
      }

      if (resetToken.used) {
        return { valid: false };
      }

      if (resetToken.expiresAt < new Date()) {
        return { valid: false };
      }

      return {
        valid: true,
        expiresAt: resetToken.expiresAt.toISOString(),
      };
    } catch (error) {
      this.logger.warn(`Failed to validate reset token: ${error}`);
      return { valid: false };
    }
  }

  async resetPassword(token: string, newPassword: string): Promise<{ accessToken: string; refreshToken: string; expiresIn: number; refreshExpiresIn: number; tokenType: string; user: UserResponseDto }> {
    try {
      // Find password reset token
      const resetToken = await this.prisma.passwordResetToken.findUnique({
        where: { token },
        include: { user: true },
      });

      if (!resetToken) {
        throw new BadRequestException('Token invalid');
      }

      if (resetToken.used) {
        throw new BadRequestException('Token already used');
      }

      if (resetToken.expiresAt < new Date()) {
        throw new BadRequestException('Token expired');
      }

      // Update password
      const hashedPassword = await bcrypt.hash(newPassword, this.bcryptRounds);
      const user = await this.usersService.update(resetToken.userId, {
        password: hashedPassword,
      });

      // Mark token as used
      await this.prisma.passwordResetToken.update({
        where: { id: resetToken.id },
        data: { used: true },
      });

      // Revoke all existing refresh tokens
      await this.prisma.refreshToken.updateMany({
        where: { userId: user.id },
        data: { revoked: true },
      });

      // Generate new tokens for automatic login
      const { accessToken, refreshToken, refreshTokenExpiresAt, expiresIn, refreshExpiresIn } = this.generateTokens(
        user.id,
        user.email,
        user.role,
      );

      // Save new refresh token
      await this.prisma.refreshToken.create({
        data: {
          userId: user.id,
          token: refreshToken,
          expiresAt: refreshTokenExpiresAt,
        },
      });

      this.logger.debug(`Password reset for user: ${user.id}`);

      return {
        accessToken,
        refreshToken,
        expiresIn,
        refreshExpiresIn,
        tokenType: 'Bearer',
        user: this.mapUserToResponse(user),
      };
    } catch (error) {
      if (error instanceof BadRequestException || error instanceof HttpException) {
        throw error;
      }

      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.warn(`Password reset failed: ${errorMessage}`);
      throw new BadRequestException('Password reset failed');
    }
  }

  async verifyEmail(email: string, code: string) {
    try {
      // Find user and verification token
      const user = await this.usersService.findByEmail(email);
      if (!user) {
        throw new BadRequestException('Invalid code');
      }

      const verificationToken = await this.prisma.verificationToken.findFirst({
        where: {
          userId: user.id,
          code: code,
          tokenType: 'EMAIL_VERIFICATION',
          used: false,
        },
      });

      if (!verificationToken) {
        throw new BadRequestException('Invalid code');
      }

      if (verificationToken.expiresAt < new Date()) {
        throw new BadRequestException('Code expired');
      }

      // Mark email as verified
      const updatedUser = await this.usersService.update(user.id, {
        emailVerified: true,
        emailVerifiedAt: new Date(),
      });

      // Mark token as used
      await this.prisma.verificationToken.update({
        where: { id: verificationToken.id },
        data: { used: true },
      });

      // Generate tokens for automatic login
      const { accessToken, refreshToken, refreshTokenExpiresAt, expiresIn, refreshExpiresIn } = this.generateTokens(
        updatedUser.id,
        updatedUser.email,
        updatedUser.role,
      );

      // Save refresh token
      await this.prisma.refreshToken.create({
        data: {
          userId: updatedUser.id,
          token: refreshToken,
          expiresAt: refreshTokenExpiresAt,
        },
      });

      this.logger.debug(`Email verified for user: ${user.id}`);

      return {
        verified: true,
        accessToken,
        refreshToken,
        expiresIn,
        refreshExpiresIn,
        tokenType: 'Bearer',
        user: this.mapUserToResponse(updatedUser),
      };
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }

      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.warn(`Email verification failed: ${errorMessage}`);
      throw new BadRequestException('Invalid code');
    }
  }

  async resendVerificationEmail(email: string): Promise<{ message: string }> {
    const user = await this.usersService.findByEmail(email);
    if (!user) {
      // Don't reveal if email exists for security
      return { message: 'If the email exists, verification email sent.' };
    }

    if (user.emailVerified) {
      return { message: 'Email is already verified.' };
    }

    // Delete old verification tokens
    await this.prisma.verificationToken.deleteMany({
      where: {
        userId: user.id,
        tokenType: 'EMAIL_VERIFICATION',
      },
    });

    // Generate new email verification code
    const verificationCode = this.generateEmailVerificationCode();
    await this.prisma.verificationToken.create({
      data: {
        userId: user.id,
        code: verificationCode,
        tokenType: 'EMAIL_VERIFICATION',
        expiresAt: addMinutes(new Date(), 10),
      },
    });

    // Send verification email
    await this.emailService.sendVerificationCode(user.firstName, user.email, verificationCode);

    this.logger.debug(`Verification email resent for user: ${user.id}`);

    return { message: 'Verification email sent.' };
  }

  // Private helper methods

  private generateTokens(userId: string, email: string, role: string) {
    const payload = { email, sub: userId, role };

    const accessTokenExpiresIn = '15m';
    const accessToken = this.jwtService.sign(payload, {
      expiresIn: accessTokenExpiresIn,
    });

    const refreshTokenExpiresIn = '30d';
    const refreshToken = this.jwtService.sign(payload, {
      secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
      expiresIn: refreshTokenExpiresIn,
    });

    // Calculate expiration date for database
    const refreshTokenExpiresAt = this.calculateExpirationDate(refreshTokenExpiresIn);
    const expiresIn = 900; // 15 minutes in seconds
    const refreshExpiresIn = 2592000; // 30 days in seconds

    return { accessToken, refreshToken, refreshTokenExpiresAt, expiresIn, refreshExpiresIn };
  }

  private calculateExpirationDate(expiresIn: string): Date {
    const now = new Date();
    const match = expiresIn.match(/^(\d+)([smhd])$/);

    if (!match) {
      return new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000); // Default to 30 days
    }

    const [, value, unit] = match;
    const numValue = parseInt(value, 10);

    switch (unit) {
      case 's':
        return new Date(now.getTime() + numValue * 1000);
      case 'm':
        return new Date(now.getTime() + numValue * 60 * 1000);
      case 'h':
        return new Date(now.getTime() + numValue * 60 * 60 * 1000);
      case 'd':
        return new Date(now.getTime() + numValue * 24 * 60 * 60 * 1000);
      default:
        return new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
    }
  }

  private generateEmailVerificationCode(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  private mapUserToResponse(user: any): UserResponseDto {
    return {
      id: user.id,
      email: user.email,
      name: `${user.firstName}${user.lastName ? ' ' + user.lastName : ''}`,
      photoUrl: user.avatar || null,
      emailVerified: user.emailVerified,
      status: user.status,
    };
  }
}