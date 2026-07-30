import { Injectable } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { UpdateSettingsDto } from './dtos/update-settings.dto';

@Injectable()
export class SettingsService {
  constructor(private readonly prisma: PrismaService) {}

  async getSettings(userId: string) {
    let settings = await this.prisma.settings.findUnique({ where: { userId } });
    
    if (!settings) {
      settings = await this.prisma.settings.create({
        data: { userId },
      });
    }

    return settings;
  }

  async updateSettings(userId: string, data: UpdateSettingsDto) {
    await this.getSettings(userId); // ensure it exists

    return this.prisma.settings.update({
      where: { userId },
      data,
    });
  }
}