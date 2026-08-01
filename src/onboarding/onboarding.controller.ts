import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Patch, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { OnboardingService } from './onboarding.service';
import { CreatePersonalDataDto } from './dtos/create-personal-data.dto';
import { CreateCompanyDataDto } from './dtos/create-company-data.dto';
import { CreateAddressDto } from './dtos/create-address.dto';
import { CreatePersonalizationDto } from './dtos/create-personalization.dto';
import { CompleteOnboardingDto } from './dtos/complete-onboarding.dto';
import { OnboardingDraftResponseDto } from './dtos/onboarding-draft-response.dto';
import { CurrentUser } from '../core/security/decorators/context.decorators';
import { UserContext } from '../core/security/interfaces/request-context.interface';
import { SuccessMessage } from '../common/decorators/success-message.decorator';
import { SuccessMessageCode } from '../common/enum/success-message-code.enum';
import { ApiStandardResponse } from '../common/decorators/api-standard-response.decorator';
import { ApiCommonErrorResponses } from '../common/decorators/api-error-responses.decorator';
import { LoginResponseDto } from '../auth/dtos/auth-response.dto';

/**
 * Wizard de cadastro (onboarding) — Steps além de Acesso/Confirmar e-mail
 * (que ficam em `AuthController`). Todas as rotas exigem só `Authorization`
 * (Bearer); o usuário ainda não tem `Membership`/conta nenhuma neste ponto,
 * então nenhuma delas usa `x-account-id`/`MembershipGuard`.
 */
@ApiTags('Onboarding')
@ApiBearerAuth()
@ApiCommonErrorResponses()
@Controller('v1/onboarding')
export class OnboardingController {
  constructor(private readonly onboardingService: OnboardingService) {}

  @Get('draft')
  @SuccessMessage(SuccessMessageCode.DATA_RETRIEVED)
  @ApiOperation({
    summary: 'Retorna o rascunho de onboarding do usuário autenticado.',
    description: '`data: null` se o usuário ainda não iniciou ou já concluiu o onboarding.',
  })
  async getDraft(@CurrentUser() user: UserContext) {
    return this.onboardingService.getDraft(user.id);
  }

  @Patch('draft/personal-data')
  @SuccessMessage(SuccessMessageCode.ONBOARDING_STEP_SAVED)
  @ApiOperation({ summary: 'Salva o Step "Dados Pessoais" (fluxo Customer).' })
  @ApiStandardResponse(OnboardingDraftResponseDto)
  async savePersonalData(@CurrentUser() user: UserContext, @Body() dto: CreatePersonalDataDto) {
    return this.onboardingService.savePersonalData(user.id, dto);
  }

  @Patch('draft/company-data')
  @SuccessMessage(SuccessMessageCode.ONBOARDING_STEP_SAVED)
  @ApiOperation({ summary: 'Salva o Step "Empresa" (fluxo Company).' })
  @ApiStandardResponse(OnboardingDraftResponseDto)
  async saveCompanyData(@CurrentUser() user: UserContext, @Body() dto: CreateCompanyDataDto) {
    return this.onboardingService.saveCompanyData(user.id, dto);
  }

  @Patch('draft/address')
  @SuccessMessage(SuccessMessageCode.ONBOARDING_STEP_SAVED)
  @ApiOperation({ summary: 'Salva o Step "Endereço" (ambos os fluxos).' })
  @ApiStandardResponse(OnboardingDraftResponseDto)
  async saveAddress(@CurrentUser() user: UserContext, @Body() dto: CreateAddressDto) {
    return this.onboardingService.saveAddress(user.id, dto);
  }

  @Patch('draft/personalization')
  @SuccessMessage(SuccessMessageCode.ONBOARDING_STEP_SAVED)
  @ApiOperation({ summary: 'Salva o Step "Personalização" (fluxo Company).' })
  @ApiStandardResponse(OnboardingDraftResponseDto)
  async savePersonalization(@CurrentUser() user: UserContext, @Body() dto: CreatePersonalizationDto) {
    return this.onboardingService.savePersonalization(user.id, dto);
  }

  @Delete('draft')
  @HttpCode(HttpStatus.OK)
  @SuccessMessage(SuccessMessageCode.ONBOARDING_DRAFT_DISCARDED)
  @ApiOperation({ summary: 'Descarta o rascunho atual (ex.: trocar de tipo de conta do zero).' })
  async discardDraft(@CurrentUser() user: UserContext) {
    await this.onboardingService.discardDraft(user.id);
  }

  @Post('complete')
  @HttpCode(HttpStatus.OK)
  @SuccessMessage(SuccessMessageCode.ONBOARDING_COMPLETED)
  @ApiOperation({
    summary: 'Conclui o onboarding — cria Account/Membership/Customer|Company/Address e reemite a sessão.',
    description: 'Requer os steps obrigatórios do tipo de conta já salvos no rascunho (400 nomeando o que falta).',
  })
  @ApiStandardResponse(LoginResponseDto)
  async complete(@CurrentUser() user: UserContext, @Body() dto: CompleteOnboardingDto) {
    return this.onboardingService.complete(user.id, user.sessionId!, dto);
  }
}
