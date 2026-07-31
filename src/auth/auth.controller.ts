import { Controller, Post, Body, HttpCode, HttpStatus, UseGuards, Get, Req, Delete, Param } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiOkResponse, ApiExtraModels, getSchemaPath } from '@nestjs/swagger';
import { Request } from 'express';

import { AuthService } from './auth.service';
import { LoginDto } from './dtos/login.dto';
import { RegisterDto } from './dtos/register.dto';
import { RefreshTokenDto } from './dtos/refresh-token.dto';
import { ForgotPasswordDto, ResetPasswordDto } from './dtos/password-reset.dto';
import { VerifyEmailDto, ResendEmailVerificationDto } from './dtos/email-verification.dto';
import { SwitchAccountDto } from './dtos/switch-account.dto';
import { LoginResponseDto } from './dtos/auth-response.dto';
import { Public } from '../common/decorators/public.decorator';
import { SkipTransform } from '../common/decorators/skip-transform.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { ApiResponseDto } from '../common/dto/api-response.dto';

@ApiTags('Authentication')
@Controller('api/v1/auth')
@SkipTransform()
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Autenticar usuário e obter contexto completo' })
  @ApiExtraModels(ApiResponseDto, LoginResponseDto)
  @ApiOkResponse({
    schema: {
      allOf: [
        { $ref: getSchemaPath(ApiResponseDto) },
        { properties: { data: { $ref: getSchemaPath(LoginResponseDto) } } },
      ],
    },
  })
  async login(@Body() dto: LoginDto, @Req() req: Request) {
    const ipAddress = (req.headers['x-forwarded-for'] || req.ip || req.socket.remoteAddress) as string;
    const userAgent = req.headers['user-agent'] || 'Unknown';
    return this.authService.login(dto, { ipAddress, userAgent });
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Encerrar sessão atual' })
  async logout(@CurrentUser() user: any) {
    await this.authService.logout(user.sessionId);
    return { success: true, timestamp: new Date().toISOString(), message: 'Logout realizado com sucesso.' };
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post('logout-all')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Encerrar todas as sessões do usuário' })
  async logoutAll(@CurrentUser() user: any) {
    await this.authService.logoutAll(user.id);
    return { success: true, timestamp: new Date().toISOString(), message: 'Todas as sessões foram encerradas.' };
  }

  @Public()
  @Post('refresh-token')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Emitir um novo Access Token antes do atual expirar' })
  async refreshToken(@Body() dto: RefreshTokenDto, @Req() req: Request) {
    const ipAddress = (req.headers['x-forwarded-for'] || req.ip || req.socket.remoteAddress) as string;
    const userAgent = req.headers['user-agent'] || 'Unknown';
    return this.authService.refreshToken(dto.refreshToken, { ipAddress, userAgent });
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('me')
  @ApiOperation({ summary: 'Retornar dados do usuário autenticado e contexto atual' })
  async getMe(@CurrentUser() user: any) {
    const context = await this.authService.getMe(user.id, user.sessionId);
    return {
      success: true,
      timestamp: new Date().toISOString(),
      message: 'Dados recuperados com sucesso.',
      ...context,
    };
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post('switch-account')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Trocar o contexto do tenant sem necessidade de novo login' })
  async switchAccount(@Body() dto: SwitchAccountDto, @CurrentUser() user: any) {
    return this.authService.switchAccount(user.id, user.sessionId, dto.membershipId);
  }

  @Public()
  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Criar um novo usuário' })
  async register(@Body() dto: RegisterDto) {
    const { userId } = await this.authService.register(dto);
    return {
      success: true,
      timestamp: new Date().toISOString(),
      message: 'Usuário registrado com sucesso. Verifique seu e-mail.',
      userId,
    };
  }

  @Public()
  @Post('verify-email')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Confirmar o e-mail do usuário recém cadastrado' })
  async verifyEmail(@Body() dto: VerifyEmailDto) {
    await this.authService.verifyEmail(dto.email, dto.code);
    return { success: true, timestamp: new Date().toISOString(), message: 'E-mail verificado com sucesso. Você já pode fazer login.' };
  }

  @Public()
  @Post('resend-verification')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Reenviar e-mail de confirmação' })
  async resendVerification(@Body() dto: ResendEmailVerificationDto) {
    await this.authService.resendVerification(dto.email);
    return { success: true, timestamp: new Date().toISOString(), message: 'Se a conta existir e não estiver verificada, um e-mail foi enviado.' };
  }

  @Public()
  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Solicitar recuperação de senha' })
  async forgotPassword(@Body() dto: ForgotPasswordDto) {
    await this.authService.forgotPassword(dto.email);
    return { success: true, timestamp: new Date().toISOString(), message: 'Se o e-mail existir, enviamos instruções para recuperar a senha.' };
  }

  @Public()
  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Definir nova senha através de token' })
  async resetPassword(@Body() dto: ResetPasswordDto) {
    await this.authService.resetPassword(dto);
    return { success: true, timestamp: new Date().toISOString(), message: 'Senha redefinida com sucesso.' };
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('sessions')
  @ApiOperation({ summary: 'Listar sessões e dispositivos ativos' })
  async getSessions(@CurrentUser() user: any) {
    const sessions = await this.authService.getSessions(user.id, user.sessionId);
    return { success: true, timestamp: new Date().toISOString(), message: 'Sessões recuperadas com sucesso.', sessions };
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Delete('sessions/:id')
  @ApiOperation({ summary: 'Desconectar um dispositivo específico remotamente' })
  async revokeSession(@Param('id') id: string, @CurrentUser() user: any) {
    await this.authService.revokeSession(user.id, id);
    return { success: true, timestamp: new Date().toISOString(), message: 'Sessão revogada com sucesso.' };
  }
}