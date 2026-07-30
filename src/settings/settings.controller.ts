import { Controller, Get, Patch, Body, UseGuards } from '@nestjs/common';
import { SettingsService } from './settings.service';
import { UpdateSettingsDto } from './dtos/update-settings.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';

@ApiTags('Configurações')
@ApiBearerAuth()
@Controller('settings')
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @UseGuards(JwtAuthGuard)
  @Get('v1')
  @ApiOperation({ summary: 'Obter configurações do usuário' })
  getSettings(@CurrentUser() user: any) {
    return this.settingsService.getSettings(user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('v1')
  @ApiOperation({ summary: 'Atualizar configurações do usuário' })
  updateSettings(@CurrentUser() user: any, @Body() updateSettingsDto: UpdateSettingsDto) {
    return this.settingsService.updateSettings(user.id, updateSettingsDto);
  }
}