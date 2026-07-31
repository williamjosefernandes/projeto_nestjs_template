import {
  Controller,
  Get,
  Patch,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  HttpCode,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { MembershipGuard } from '../core/security/guards/membership.guard';
import { PermissionGuard } from '../core/security/guards/permission.guard';
import {
  CurrentUser,
  CurrentAccount,
  CurrentMembership,
} from '../core/security/decorators/context.decorators';
import { Permissions } from '../core/security/decorators/metadata.decorators';
import {
  UserContext,
  AccountContext,
  MembershipContext,
} from '../core/security/interfaces/request-context.interface';
import { SuccessMessage } from '../common/decorators/success-message.decorator';
import { SuccessMessageCode } from '../common/enum/success-message-code.enum';
import { SkipTransform } from '../common/decorators/skip-transform.decorator';
import { ApiStandardResponse } from '../common/decorators/api-standard-response.decorator';
import { ApiCommonErrorResponses } from '../common/decorators/api-error-responses.decorator';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiConsumes,
  ApiBody,
  ApiParam,
} from '@nestjs/swagger';
// dtos
import { UpdateProfileDto } from './dtos/update-profile.dto';
import { ChangePasswordDto } from './dtos/change-password.dto';
import { UpdatePreferencesDto } from './dtos/update-preferences.dto';
import {
  CreateUserAdminDto,
  UpdateUserAdminDto,
  UpdateUserStatusDto,
} from './dtos/admin-users.dto';
import { ListUsersQueryDto } from './dtos/list-users-query.dto';
import {
  UserMeResponseDto,
  PublicUserResponseDto,
} from './dtos/user-responses.dto';
import { UserPreferencesResponseDto } from './dtos/user-preferences-response.dto';
import { UserPermissionsResponseDto } from './dtos/user-permissions-response.dto';
import { SessionResponseDto } from '../auth/dtos/session.dto';

import { FileInterceptor } from '@nestjs/platform-express';

@ApiTags('Identity / Users')
@ApiBearerAuth()
@ApiCommonErrorResponses()
@Controller({ path: 'users', version: '1' })
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // ============================================================================
  // IDENTITY (Meu Perfil)
  // ============================================================================

  @Get('me')
  @SuccessMessage(SuccessMessageCode.PROFILE_RETRIEVED)
  @ApiOperation({
    summary: 'Retornar os dados completos do usuário autenticado.',
  })
  @ApiStandardResponse(UserMeResponseDto)
  async getProfile(@CurrentUser() user: UserContext) {
    return this.usersService.getMe(user.id);
  }

  @Put('me')
  @SuccessMessage(SuccessMessageCode.PROFILE_UPDATED)
  @ApiOperation({ summary: 'Atualizar perfil do usuário autenticado.' })
  @ApiStandardResponse(UserMeResponseDto)
  async updateProfile(
    @CurrentUser() user: UserContext,
    @Body() dto: UpdateProfileDto,
  ) {
    return this.usersService.updateMe(user.id, dto);
  }

  @Patch('me/avatar')
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: { file: { type: 'string', format: 'binary' } },
    },
  })
  @SuccessMessage(SuccessMessageCode.AVATAR_UPDATED)
  @ApiOperation({ summary: 'Alterar avatar do usuário autenticado.' })
  async updateAvatar(
    @CurrentUser() user: UserContext,
    @UploadedFile() file: any,
  ) {
    return this.usersService.updateAvatar(user.id, file);
  }

  @Delete('me/avatar')
  @SuccessMessage(SuccessMessageCode.AVATAR_REMOVED)
  @ApiOperation({ summary: 'Remover avatar do usuário autenticado.' })
  async removeAvatar(@CurrentUser() user: UserContext) {
    await this.usersService.removeAvatar(user.id);
  }

  @Patch('me/password')
  @SuccessMessage(SuccessMessageCode.PASSWORD_CHANGED)
  @ApiOperation({ summary: 'Alterar senha do usuário autenticado.' })
  async changePassword(
    @CurrentUser() user: UserContext,
    @Body() dto: ChangePasswordDto,
  ) {
    await this.usersService.changePassword(user.id, dto);
  }

  @Get('me/preferences')
  @SuccessMessage(SuccessMessageCode.DATA_RETRIEVED)
  @ApiOperation({ summary: 'Retornar as preferências de UI/UX do usuário.' })
  @ApiStandardResponse(UserPreferencesResponseDto)
  async getPreferences(@CurrentUser() user: UserContext) {
    return this.usersService.getPreferences(user.id);
  }

  @Put('me/preferences')
  @SuccessMessage(SuccessMessageCode.PREFERENCES_UPDATED)
  @ApiOperation({ summary: 'Atualizar as preferências do usuário.' })
  @ApiStandardResponse(UserPreferencesResponseDto)
  async updatePreferences(
    @CurrentUser() user: UserContext,
    @Body() dto: UpdatePreferencesDto,
  ) {
    return this.usersService.updatePreferences(user.id, dto);
  }

  @Get('me/accounts')
  @SuccessMessage(SuccessMessageCode.DATA_RETRIEVED)
  @ApiOperation({
    summary:
      'Listar todas as contas/empresas nas quais o usuário possui um membership.',
  })
  async getAccounts(@CurrentUser() user: UserContext) {
    return this.usersService.getAccounts(user.id);
  }

  @Get('me/permissions')
  @UseGuards(MembershipGuard)
  @SuccessMessage(SuccessMessageCode.DATA_RETRIEVED)
  @ApiOperation({
    summary:
      'Retornar a matriz consolidada de permissões baseada no Membership atual.',
    description:
      'Requer o header `x-account-id` para resolver o Membership ativo.',
  })
  @ApiStandardResponse(UserPermissionsResponseDto)
  async getPermissions(@CurrentMembership() membership: MembershipContext) {
    return this.usersService.getPermissions(membership.id);
  }

  @Get('me/sessions')
  @SuccessMessage(SuccessMessageCode.SESSIONS_RETRIEVED)
  @ApiOperation({ summary: 'Listar as sessões ativas do usuário.' })
  @ApiStandardResponse(SessionResponseDto, { isArray: true })
  async getSessions(@CurrentUser() user: UserContext) {
    return this.usersService.getSessions(user.id, user.sessionId);
  }

  @Delete('me/sessions/:id')
  @SuccessMessage(SuccessMessageCode.SESSION_REVOKED)
  @ApiOperation({
    summary: 'Revogar (encerrar) uma sessão específica remotamente.',
  })
  @ApiParam({ name: 'id', description: 'ID (UUID) da sessão.' })
  async revokeSession(
    @CurrentUser() user: UserContext,
    @Param('id') sessionId: string,
  ) {
    await this.usersService.revokeSession(user.id, sessionId);
  }

  // ============================================================================
  // ADMIN DA CONTA (exige Membership ativo + permissão RBAC do módulo `users`)
  // ============================================================================

  @Get(':id')
  @UseGuards(MembershipGuard, PermissionGuard)
  @Permissions('users.read')
  @SuccessMessage(SuccessMessageCode.DATA_RETRIEVED)
  @ApiOperation({
    summary:
      'Recuperar perfil público de um usuário (apenas se pertencer à mesma conta).',
    description: 'Requer o header `x-account-id` e a permissão `users.read`.',
  })
  @ApiParam({ name: 'id', description: 'ID (UUID) do usuário.' })
  @ApiStandardResponse(PublicUserResponseDto)
  async getPublicProfile(
    @CurrentAccount() account: AccountContext,
    @Param('id') id: string,
  ) {
    return this.usersService.getPublicProfile(id, account.id);
  }

  @Get()
  @UseGuards(MembershipGuard, PermissionGuard)
  @Permissions('users.read')
  @SuccessMessage(SuccessMessageCode.DATA_RETRIEVED)
  @ApiOperation({
    summary: 'Listagem paginada e filtrada de usuários da conta atual.',
    description: 'Requer o header `x-account-id` e a permissão `users.read`.',
  })
  async listUsers(
    @CurrentAccount() account: AccountContext,
    @Query() query: ListUsersQueryDto,
  ) {
    return this.usersService.listUsers(account.id, query);
  }

  @Post()
  @UseGuards(MembershipGuard, PermissionGuard)
  @Permissions('users.create')
  @SuccessMessage(SuccessMessageCode.USER_INVITED)
  @ApiOperation({
    summary: 'Criar um usuário manualmente e vinculá-lo à conta atual.',
    description:
      'Requer o header `x-account-id` e a permissão `users.create`. Envia e-mail de definição de senha.',
  })
  @ApiStandardResponse(UserMeResponseDto, { created: true })
  async createUser(
    @CurrentAccount() account: AccountContext,
    @Body() dto: CreateUserAdminDto,
  ) {
    return this.usersService.createUserAdmin(account.id, dto);
  }

  @Put(':id')
  @UseGuards(MembershipGuard, PermissionGuard)
  @Permissions('users.update')
  @SuccessMessage(SuccessMessageCode.USER_UPDATED)
  @ApiOperation({
    summary: 'Editar dados básicos de um usuário do sistema.',
    description: 'Requer o header `x-account-id` e a permissão `users.update`.',
  })
  @ApiParam({ name: 'id', description: 'ID (UUID) do usuário.' })
  @ApiStandardResponse(UserMeResponseDto)
  async updateUser(
    @CurrentAccount() account: AccountContext,
    @Param('id') id: string,
    @Body() dto: UpdateUserAdminDto,
  ) {
    return this.usersService.updateUserAdmin(account.id, id, dto);
  }

  @Delete(':id')
  @HttpCode(204)
  @SkipTransform()
  @UseGuards(MembershipGuard, PermissionGuard)
  @Permissions('users.delete')
  @ApiOperation({
    summary: 'Soft delete do usuário da conta.',
    description: 'Requer o header `x-account-id` e a permissão `users.delete`.',
  })
  @ApiParam({ name: 'id', description: 'ID (UUID) do usuário.' })
  async deleteUser(
    @CurrentAccount() account: AccountContext,
    @Param('id') id: string,
  ) {
    await this.usersService.softDeleteUser(account.id, id);
  }

  @Patch(':id/status')
  @UseGuards(MembershipGuard, PermissionGuard)
  @Permissions('users.update')
  @SuccessMessage(SuccessMessageCode.USER_STATUS_UPDATED)
  @ApiOperation({
    summary: 'Alterar o status de um usuário.',
    description: 'Requer o header `x-account-id` e a permissão `users.update`.',
  })
  @ApiParam({ name: 'id', description: 'ID (UUID) do usuário.' })
  async updateUserStatus(
    @CurrentAccount() account: AccountContext,
    @Param('id') id: string,
    @Body() dto: UpdateUserStatusDto,
  ) {
    await this.usersService.updateUserStatus(account.id, id, dto);
  }
}
