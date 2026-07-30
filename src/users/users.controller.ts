import { Controller, Get, Patch, Post, Body, UseGuards, UnauthorizedException } from '@nestjs/common';
import { UsersService } from './users.service';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { UpdateProfileDto } from './dtos/update-profile.dto';
import { ChangePasswordDto } from './dtos/change-password.dto';
import * as bcrypt from 'bcrypt';

@ApiTags('Usuários')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('v1/me')
  @ApiOperation({ summary: 'Obter perfil do usuário atual' })
  async getProfile(@CurrentUser() user: any) {
    const profile = await this.usersService.findById(user.id);
    if (profile) {
      // @ts-ignore
      delete profile.password;
      // @ts-ignore
      delete profile.refreshTokenHash;
    }
    return profile;
  }

  @Patch('v1/me')
  @ApiOperation({ summary: 'Atualizar perfil do usuário atual' })
  async updateProfile(@CurrentUser() user: any, @Body() dto: UpdateProfileDto) {
    const updated = await this.usersService.update(user.id, dto);
    // @ts-ignore
    delete updated.password;
    // @ts-ignore
    delete updated.refreshTokenHash;
    return updated;
  }

  @Post('v1/me/password')
  @ApiOperation({ summary: 'Alterar senha do usuário' })
  async changePassword(@CurrentUser() user: any, @Body() dto: ChangePasswordDto) {
    const currentUser = await this.usersService.findById(user.id);
    const isOldPasswordValid = await bcrypt.compare(dto.oldPassword, currentUser!.password);
    if (!isOldPasswordValid) {
      throw new UnauthorizedException('Invalid old password');
    }
    const newHash = await bcrypt.hash(dto.newPassword, 10);
    await this.usersService.updatePassword(user.id, newHash);
    return { success: true, message: 'Password updated successfully' };
  }

}