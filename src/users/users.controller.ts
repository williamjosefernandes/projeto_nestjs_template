import { Controller, Get, Patch, Post, Put, Delete, Body, Param, Query, UseGuards, UseInterceptors, UploadedFile, HttpCode } from '@nestjs/common';
import { UsersService } from './users.service';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiConsumes, ApiBody, ApiOkResponse, ApiBadRequestResponse } from '@nestjs/swagger';
// dtos
import { UpdateProfileDto } from './dtos/update-profile.dto';
import { ChangePasswordDto } from './dtos/change-password.dto';
import { UpdatePreferencesDto } from './dtos/update-preferences.dto';
import { CreateUserAdminDto, UpdateUserAdminDto, UpdateUserStatusDto } from './dtos/admin-users.dto';

// Para mockar FileInterceptor e File Upload tipings sem a necessidade de todas dependências no nest.
import { FileInterceptor } from '@nestjs/platform-express';
import { Express } from 'express';
// Note: Some decorators like @Roles() @Permissions() aren't fully implemented in this module but would exist.
// We use simple strings or comments here for `Permissão` tracking as specified in the rules.

@ApiTags('Identity / Users')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller({ path: 'users', version: '1' })
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // ============================================================================
  // IDENTITY (Meu Perfil)
  // ============================================================================

  @Get('me')
  @ApiOperation({ summary: 'Retornar os dados completos do usuário autenticado.' })
  async getProfile(@CurrentUser() user: any) {
    const profile = await this.usersService.getMe(user.id);
    return { success: true, message: 'Perfil recuperado com sucesso.', data: this.sanitizeUser(profile) };
  }

  @Put('me')
  @ApiOperation({ summary: 'Atualizar perfil do usuário autenticado.' })
  async updateProfile(@CurrentUser() user: any, @Body() dto: UpdateProfileDto) {
    const updated = await this.usersService.updateMe(user.id, dto);
    return { success: true, message: 'Perfil atualizado com sucesso.', data: this.sanitizeUser(updated) };
  }

  @Patch('me/avatar')
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiBody({ schema: { type: 'object', properties: { file: { type: 'string', format: 'binary' } } } })
  @ApiOperation({ summary: 'Alterar avatar do usuário autenticado.' })
  async updateAvatar(@CurrentUser() user: any, @UploadedFile() file: any) {
    const result = await this.usersService.updateAvatar(user.id, file);
    return { success: true, message: 'Avatar atualizado com sucesso.', data: result };
  }

  @Delete('me/avatar')
  @ApiOperation({ summary: 'Remover avatar do usuário autenticado.' })
  async removeAvatar(@CurrentUser() user: any) {
    await this.usersService.removeAvatar(user.id);
    return { success: true, message: 'Avatar removido com sucesso.' };
  }

  @Patch('me/password')
  @ApiOperation({ summary: 'Alterar senha do usuário autenticado.' })
  async changePassword(@CurrentUser() user: any, @Body() dto: ChangePasswordDto) {
    await this.usersService.changePassword(user.id, dto);
    return { success: true, message: 'Senha atualizada com sucesso.' };
  }

  @Get('me/preferences')
  @ApiOperation({ summary: 'Retornar as preferências de UI/UX do usuário.' })
  async getPreferences(@CurrentUser() user: any) {
    const pref = await this.usersService.getPreferences(user.id);
    return { success: true, data: pref };
  }

  @Put('me/preferences')
  @ApiOperation({ summary: 'Atualizar as preferências do usuário.' })
  async updatePreferences(@CurrentUser() user: any, @Body() dto: UpdatePreferencesDto) {
    const updated = await this.usersService.updatePreferences(user.id, dto);
    return { success: true, message: 'Preferências atualizadas.', data: updated };
  }

  @Get('me/accounts')
  @ApiOperation({ summary: 'Listar todas as contas/empresas nas quais o usuário possui um membership.' })
  async getAccounts(@CurrentUser() user: any) {
    const accounts = await this.usersService.getAccounts(user.id);
    return { success: true, data: accounts };
  }

  @Get('me/permissions')
  @ApiOperation({ summary: 'Retornar a matriz consolidada de permissões baseada no Membership atual.' })
  async getPermissions(@CurrentUser() user: any) {
    // Current AccountId can be extracted from JWT or headers. Assuming user.accountId.
    const accountId = user.accountId;
    const permissions = await this.usersService.getPermissions(user.id, accountId);
    return { success: true, data: permissions };
  }

  @Get('me/sessions')
  @ApiOperation({ summary: 'Listar as sessões ativas do usuário.' })
  async getSessions(@CurrentUser() user: any) {
    const sessions = await this.usersService.getSessions(user.id);
    return { success: true, data: sessions };
  }

  @Delete('me/sessions/:id')
  @ApiOperation({ summary: 'Revogar (encerrar) uma sessão específica remotamente.' })
  async revokeSession(@CurrentUser() user: any, @Param('id') sessionId: string) {
    await this.usersService.revokeSession(user.id, sessionId);
    return { success: true, message: 'Sessão encerrada com sucesso.' };
  }

  // ============================================================================
  // ADMIN PLATAFORMA (Requer permissões RBAC do módulo)
  // ============================================================================

  @Get(':id')
  @ApiOperation({ summary: 'Recuperar perfil público de um usuário (apenas se pertencer à mesma conta).' })
  async getPublicProfile(@CurrentUser() user: any, @Param('id') id: string) {
    const profile = await this.usersService.getPublicProfile(id, user.accountId);
    return { success: true, data: profile };
  }

  @Get()
  @ApiOperation({ summary: 'Listagem paginada e filtrada de usuários da conta atual.' })
  async listUsers(@CurrentUser() user: any, @Query() query: any) {
    const result = await this.usersService.listUsers(user.accountId, query);
    return { success: true, data: result.items, meta: result.meta };
  }

  @Post()
  @ApiOperation({ summary: 'Criar um usuário manualmente e vinculá-lo à conta atual.' })
  async createUser(@CurrentUser() user: any, @Body() dto: CreateUserAdminDto) {
    const created = await this.usersService.createUserAdmin(user.accountId, dto);
    return { success: true, message: 'Usuário convidado com sucesso.', data: this.sanitizeUser(created) };
  }

  @Put(':id')
  @ApiOperation({ summary: 'Editar dados básicos de um usuário do sistema.' })
  async updateUser(@CurrentUser() user: any, @Param('id') id: string, @Body() dto: UpdateUserAdminDto) {
    const updated = await this.usersService.updateUserAdmin(user.accountId, id, dto);
    return { success: true, message: 'Usuário atualizado com sucesso.', data: this.sanitizeUser(updated) };
  }

  @Delete(':id')
  @HttpCode(204)
  @ApiOperation({ summary: 'Soft delete do usuário da conta.' })
  async deleteUser(@CurrentUser() user: any, @Param('id') id: string) {
    await this.usersService.softDeleteUser(user.accountId, id);
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Alterar o status de um usuário.' })
  async updateUserStatus(@CurrentUser() user: any, @Param('id') id: string, @Body() dto: UpdateUserStatusDto) {
    await this.usersService.updateUserStatus(user.accountId, id, dto);
    return { success: true, message: 'Status do usuário atualizado com sucesso.' };
  }

  // ============================================================================
  // Helpers
  // ============================================================================

  private sanitizeUser(user: any) {
    if (user) {
      delete user.password;
      delete user.refreshTokenHash;
      delete user.tokens;
    }
    return user;
  }
}