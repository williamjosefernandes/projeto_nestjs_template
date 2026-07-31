import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  Get,
  Req,
  Delete,
  Param,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
} from '@nestjs/swagger';
import { Throttle, ThrottlerGuard } from '@nestjs/throttler';
import { Request } from 'express';

import { AuthService } from './auth.service';
import { LoginDto } from './dtos/login.dto';
import { RegisterDto } from './dtos/register.dto';
import { RefreshTokenDto } from './dtos/refresh-token.dto';
import { ForgotPasswordDto, ResetPasswordDto } from './dtos/password-reset.dto';
import {
  VerifyEmailDto,
  ResendEmailVerificationDto,
} from './dtos/email-verification.dto';
import { SwitchAccountDto } from './dtos/switch-account.dto';
import {
  LoginResponseDto,
  MeContextResponseDto,
} from './dtos/auth-response.dto';
import { SessionResponseDto } from './dtos/session.dto';
import { Public } from '../core/security/decorators/metadata.decorators';
import { SuccessMessage } from '../common/decorators/success-message.decorator';
import { SuccessMessageCode } from '../common/enum/success-message-code.enum';
import { CurrentUser } from '../core/security/decorators/context.decorators';
import { UserContext } from '../core/security/interfaces/request-context.interface';
import { ApiStandardResponse } from '../common/decorators/api-standard-response.decorator';
import { ApiCommonErrorResponses } from '../common/decorators/api-error-responses.decorator';

/** Endpoints de autenticação — superfície sensível a brute-force/abuso, protegida por rate limiting. */
@ApiTags('Authentication')
@ApiCommonErrorResponses()
@UseGuards(ThrottlerGuard)
@Controller('v1/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @SuccessMessage(SuccessMessageCode.LOGIN_SUCCESS)
  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  @ApiOperation({
    summary: 'Autenticar usuário e obter contexto completo',
    description: 'Endpoint público. Limitado a 5 tentativas por minuto por IP.',
  })
  @ApiStandardResponse(LoginResponseDto)
  async login(@Body() dto: LoginDto, @Req() req: Request) {
    const ipAddress = (req.headers['x-forwarded-for'] ||
      req.ip ||
      req.socket.remoteAddress) as string;
    const userAgent = req.headers['user-agent'] || 'Unknown';
    return this.authService.login(dto, { ipAddress, userAgent });
  }

  @ApiBearerAuth()
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @SuccessMessage(SuccessMessageCode.LOGOUT_SUCCESS)
  @ApiOperation({ summary: 'Encerrar sessão atual' })
  async logout(@CurrentUser() user: UserContext) {
    await this.authService.logout(user.sessionId);
  }

  @ApiBearerAuth()
  @Post('logout-all')
  @HttpCode(HttpStatus.OK)
  @SuccessMessage(SuccessMessageCode.LOGOUT_ALL_SUCCESS)
  @ApiOperation({ summary: 'Encerrar todas as sessões do usuário' })
  async logoutAll(@CurrentUser() user: UserContext) {
    await this.authService.logoutAll(user.id);
  }

  @Public()
  @Post('refresh-token')
  @HttpCode(HttpStatus.OK)
  @SuccessMessage(SuccessMessageCode.TOKEN_REFRESHED)
  @ApiOperation({
    summary: 'Emitir um novo Access Token antes do atual expirar',
    description:
      'Endpoint público — autenticado via refresh token no corpo, não via Bearer.',
  })
  @ApiStandardResponse(LoginResponseDto)
  async refreshToken(@Body() dto: RefreshTokenDto, @Req() req: Request) {
    const ipAddress = (req.headers['x-forwarded-for'] ||
      req.ip ||
      req.socket.remoteAddress) as string;
    const userAgent = req.headers['user-agent'] || 'Unknown';
    return this.authService.refreshToken(dto.refreshToken, {
      ipAddress,
      userAgent,
    });
  }

  @ApiBearerAuth()
  @Get('me')
  @SuccessMessage(SuccessMessageCode.ME_RETRIEVED)
  @ApiOperation({
    summary: 'Retornar dados do usuário autenticado e contexto atual',
  })
  @ApiStandardResponse(MeContextResponseDto)
  async getMe(@CurrentUser() user: UserContext) {
    return this.authService.getMe(user.id, user.sessionId);
  }

  @ApiBearerAuth()
  @Post('switch-account')
  @HttpCode(HttpStatus.OK)
  @SuccessMessage(SuccessMessageCode.ACCOUNT_SWITCHED)
  @ApiOperation({
    summary: 'Trocar o contexto do tenant sem necessidade de novo login',
  })
  @ApiStandardResponse(LoginResponseDto)
  async switchAccount(
    @Body() dto: SwitchAccountDto,
    @CurrentUser() user: UserContext,
  ) {
    return this.authService.switchAccount(
      user.id,
      user.sessionId,
      dto.membershipId,
    );
  }

  @Public()
  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @SuccessMessage(SuccessMessageCode.REGISTER_SUCCESS)
  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  @ApiOperation({
    summary: 'Criar um novo usuário',
    description: 'Endpoint público. Limitado a 5 tentativas por minuto por IP.',
  })
  async register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Public()
  @Post('verify-email')
  @HttpCode(HttpStatus.OK)
  @SuccessMessage(SuccessMessageCode.EMAIL_VERIFIED)
  @ApiOperation({
    summary: 'Confirmar o e-mail do usuário recém cadastrado',
    description: 'Endpoint público.',
  })
  async verifyEmail(@Body() dto: VerifyEmailDto) {
    await this.authService.verifyEmail(dto.email, dto.code);
  }

  @Public()
  @Post('resend-verification')
  @HttpCode(HttpStatus.OK)
  @SuccessMessage(SuccessMessageCode.VERIFICATION_RESENT)
  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  @ApiOperation({
    summary: 'Reenviar e-mail de confirmação',
    description: 'Endpoint público. Limitado a 5 tentativas por minuto por IP.',
  })
  async resendVerification(@Body() dto: ResendEmailVerificationDto) {
    await this.authService.resendVerification(dto.email);
  }

  @Public()
  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  @SuccessMessage(SuccessMessageCode.PASSWORD_RESET_REQUESTED)
  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  @ApiOperation({
    summary: 'Solicitar recuperação de senha',
    description: 'Endpoint público. Limitado a 5 tentativas por minuto por IP.',
  })
  async forgotPassword(@Body() dto: ForgotPasswordDto) {
    await this.authService.forgotPassword(dto.email);
  }

  @Public()
  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  @SuccessMessage(SuccessMessageCode.PASSWORD_RESET_SUCCESS)
  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  @ApiOperation({
    summary: 'Definir nova senha através de token',
    description: 'Endpoint público. Limitado a 5 tentativas por minuto por IP.',
  })
  async resetPassword(@Body() dto: ResetPasswordDto) {
    await this.authService.resetPassword(dto);
  }

  @ApiBearerAuth()
  @Get('sessions')
  @SuccessMessage(SuccessMessageCode.SESSIONS_RETRIEVED)
  @ApiOperation({ summary: 'Listar sessões e dispositivos ativos' })
  @ApiStandardResponse(SessionResponseDto, { isArray: true })
  async getSessions(@CurrentUser() user: UserContext) {
    return this.authService.getSessions(user.id, user.sessionId);
  }

  @ApiBearerAuth()
  @Delete('sessions/:id')
  @SuccessMessage(SuccessMessageCode.SESSION_REVOKED)
  @ApiOperation({
    summary: 'Desconectar um dispositivo específico remotamente',
  })
  @ApiParam({ name: 'id', description: 'ID (UUID) da sessão.' })
  async revokeSession(
    @Param('id') id: string,
    @CurrentUser() user: UserContext,
  ) {
    await this.authService.revokeSession(user.id, id);
  }
}
