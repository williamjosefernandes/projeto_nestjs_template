import { Controller, Post, Body, HttpCode, HttpStatus, UseGuards, Get, Req, Delete, Param } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { Request } from 'express';

import { AuthService } from './auth.service';
import { LoginDto } from './dtos/login.dto';
import { RegisterDto } from './dtos/register.dto';
import { RefreshTokenDto } from './dtos/refresh-token.dto';
import { ForgotPasswordDto, ResetPasswordDto } from './dtos/password-reset.dto';
import { VerifyEmailDto, ResendEmailVerificationDto } from './dtos/email-verification.dto';
import { SwitchAccountDto } from './dtos/switch-account.dto';
import { Public } from '../common/decorators/public.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@ApiTags('Authentication')
@Controller('api/v1/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Autenticar usuário e obter contexto completo' })
  async login(@Body() dto: LoginDto, @Req() req: Request) {
    const ipAddress = (req.headers['x-forwarded-for'] || req.ip || req.socket.remoteAddress) as string;
    const userAgent = req.headers['user-agent'] || 'Unknown';
    const data = await this.authService.login(dto, { ipAddress, userAgent });
    return { success: true, message: 'Login realizado com sucesso.', data };
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Encerrar sessão atual' })
  async logout(@CurrentUser() user: any) {
    await this.authService.logout(user.sessionId);
    return { success: true, message: 'Logout realizado com sucesso.', data: null };
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post('logout-all')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Encerrar todas as sessões do usuário' })
  async logoutAll(@CurrentUser() user: any) {
    await this.authService.logoutAll(user.id);
    return { success: true, message: 'Todas as sessões foram encerradas.', data: null };
  }

  @Public()
  @Post('refresh-token')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Emitir um novo Access Token antes do atual expirar' })
  async refreshToken(@Body() dto: RefreshTokenDto, @Req() req: Request) {
    const ipAddress = (req.headers['x-forwarded-for'] || req.ip || req.socket.remoteAddress) as string;
    const userAgent = req.headers['user-agent'] || 'Unknown';
    const data = await this.authService.refreshToken(dto.refreshToken, { ipAddress, userAgent });
    return { success: true, message: 'Token atualizado com sucesso.', data };
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('me')
  @ApiOperation({ summary: 'Retornar dados do usuário autenticado e contexto atual' })
  async getMe(@CurrentUser() user: any) {
    const data = await this.authService.getMe(user.id, user.sessionId);
    return { success: true, message: 'Dados recuperados com sucesso.', data };
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post('switch-account')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Trocar o contexto do tenant sem necessidade de novo login' })
  async switchAccount(@Body() dto: SwitchAccountDto, @CurrentUser() user: any) {
    const data = await this.authService.switchAccount(user.id, user.sessionId, dto.membershipId);
    return { success: true, message: 'Conta alterada com sucesso.', data };
  }

  @Public()
  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Criar um novo usuário' })
  async register(@Body() dto: RegisterDto) {
    const data = await this.authService.register(dto);
    return { success: true, message: 'Usuário registrado com sucesso. Verifique seu e-mail.', data };
  }

  @Public()
  @Post('verify-email')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Confirmar o e-mail do usuário recém cadastrado' })
  async verifyEmail(@Body() dto: VerifyEmailDto) {
    await this.authService.verifyEmail(dto.email, dto.code);
    return { success: true, message: 'E-mail verificado com sucesso. Você já pode fazer login.', data: null };
  }

  @Public()
  @Post('resend-verification')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Reenviar e-mail de confirmação' })
  async resendVerification(@Body() dto: ResendEmailVerificationDto) {
    await this.authService.resendVerification(dto.email);
    return { success: true, message: 'Se a conta existir e não estiver verificada, um e-mail foi enviado.', data: null };
  }

  @Public()
  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Solicitar recuperação de senha' })
  async forgotPassword(@Body() dto: ForgotPasswordDto) {
    await this.authService.forgotPassword(dto.email);
    return { success: true, message: 'Se o e-mail existir, enviamos instruções para recuperar a senha.', data: null };
  }

  @Public()
  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Definir nova senha através de token' })
  async resetPassword(@Body() dto: ResetPasswordDto) {
    await this.authService.resetPassword(dto);
    return { success: true, message: 'Senha redefinida com sucesso.', data: null };
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('sessions')
  @ApiOperation({ summary: 'Listar sessões e dispositivos ativos' })
  async getSessions(@CurrentUser() user: any) {
    const data = await this.authService.getSessions(user.id, user.sessionId);
    return { success: true, message: 'Sessões recuperadas com sucesso.', data };
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Delete('sessions/:id')
  @ApiOperation({ summary: 'Desconectar um dispositivo específico remotamente' })
  async revokeSession(@Param('id') id: string, @CurrentUser() user: any) {
    await this.authService.revokeSession(user.id, id);
    return { success: true, message: 'Sessão revogada com sucesso.', data: null };
  }
}