import { IsOptional, IsEnum, IsBoolean, IsString, IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Theme, Language } from '@prisma/client';

export class UpdateSettingsDto {
  @ApiProperty({ enum: Theme, required: false })
  @IsEnum(Theme)
  @IsOptional()
  theme?: Theme;

  @ApiProperty({ enum: Language, required: false })
  @IsEnum(Language)
  @IsOptional()
  language?: Language;

  @ApiProperty({ required: false })
  @IsBoolean()
  @IsOptional()
  notificationsEnabled?: boolean;

  @ApiProperty({ required: false })
  @IsBoolean()
  @IsOptional()
  emailNotifications?: boolean;

  @ApiProperty({ required: false })
  @IsBoolean()
  @IsOptional()
  pushNotifications?: boolean;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  emailFrequency?: string;

  @ApiProperty({ required: false })
  @IsNumber()
  @IsOptional()
  dailyGoalMinutes?: number;
}