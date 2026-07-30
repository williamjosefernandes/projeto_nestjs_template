import { Controller, Post, Body, HttpCode, HttpStatus, UseGuards, Get, Req } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { Request } from 'express';

import { AuthService } from './auth.service';
import { LoginDto } from './dtos/login.dto';
import { RegisterDto } from './dtos/register.dto';
import { RefreshTokenDto } from './dtos/refresh-token.dto';
import { CheckEmailDto, CheckEmailResponseDto } from './dtos/check-email.dto';
import { ForgotPasswordDto, ValidateResetPasswordTokenDto, ValidateResetPasswordTokenResponseDto, ResetPasswordDto } from './dtos/password-reset.dto';
import { VerifyEmailDto, ResendEmailVerificationDto, VerifyEmailResponseDto } from './dtos/email-verification.dto';
import { AuthResponseDto, RefreshTokenResponseDto } from './dtos/auth-response.dto';
import { Public } from '../common/decorators/public.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@ApiTags('Autenticação')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('v1/register')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Registrar novo usuário' })
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Public()
  @Post('v1/check-email')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Verificar se email existe e obter métodos de login' })
  async checkEmail(@Body() dto: CheckEmailDto): Promise<CheckEmailResponseDto> {
    return this.authService.checkEmail(dto.email);
  }

  @Public()
  @Post('v1/login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Fazer login com email e senha' })
  @ApiResponse({ status: 200, type: AuthResponseDto, description: 'Login realizado com sucesso' })
  @ApiResponse({ status: 401, description: 'Credenciais inválidas' })
  async login(@Body() loginDto: LoginDto, @Req() req: Request): Promise<AuthResponseDto> {
    const ipAddress = req.ip || req.socket.remoteAddress;
    return this.authService.login(loginDto, ipAddress);
  }

  @Public()
  @Post('v1/refresh-token')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Renovar token de acesso usando refresh token' })
  @ApiResponse({ status: 200, type: RefreshTokenResponseDto, description: 'Token renovado com sucesso' })
  @ApiResponse({ status: 401, description: 'Token de atualização inválido ou expirado' })
  async refreshToken(@Body() dto: RefreshTokenDto, @Req() req: Request): Promise<RefreshTokenResponseDto> {
    const ipAddress = req.ip || req.socket.remoteAddress;
    return this.authService.refreshAccessToken(dto.refreshToken, ipAddress);
  }

  @Public()
  @Post('v1/forgot-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Solicitar redefinição de senha' })
  async forgotPassword(@Body() dto: ForgotPasswordDto) {
    return this.authService.forgotPassword(dto.email);
  }

  @Public()
  @Post('v1/validate-reset-password-token')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Validar token de redefinição de senha' })
  async validateResetPasswordToken(@Body() dto: ValidateResetPasswordTokenDto): Promise<ValidateResetPasswordTokenResponseDto> {
    return this.authService.validateResetPasswordToken(dto.token);
  }

  @Public()
  @Post('v1/reset-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Redefinir senha usando token' })
  @ApiResponse({ status: 200, description: 'Senha redefinida com sucesso' })
  @ApiResponse({ status: 400, description: 'Token inválido ou expirado' })
  async resetPassword(@Body() dto: ResetPasswordDto): Promise<AuthResponseDto> {
    return this.authService.resetPassword(dto.token, dto.newPassword);
  }

  @Public()
  @Post('v1/verify-email')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Verificar email usando código' })
  @ApiResponse({ status: 200, description: 'Email verificado com sucesso' })
  @ApiResponse({ status: 400, description: 'Código inválido ou expirado' })
  async verifyEmail(@Body() dto: VerifyEmailDto): Promise<VerifyEmailResponseDto> {
    return this.authService.verifyEmail(dto.email, dto.code);
  }

  @Public()
  @Post('v1/resend-email-verification')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Reenviar código de verificação de email' })
  @ApiResponse({ status: 200, description: 'Email de verificação enviado' })
  async resendEmailVerification(@Body() dto: ResendEmailVerificationDto) {
    return this.authService.resendVerificationEmail(dto.email);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post('v1/logout')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Fazer logout e revogar refresh token' })
  @ApiResponse({ status: 200, description: 'Logout realizado com sucesso' })
  async logout(@CurrentUser() user: any): Promise<{ success: boolean }> {
    return this.authService.logout(user.id);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('v1/me')
  @ApiOperation({ summary: 'Obter informações básicas do usuário atual via autenticação' })
  async getMe(@CurrentUser() user: any) {
    return user;
  }
}