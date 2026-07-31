import { IsString, IsOptional, IsEnum } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  UserTheme,
  UserLanguage,
  UserTimeFormat,
} from './user-preference.enums';

export class UpdatePreferencesDto {
  @ApiPropertyOptional({ enum: UserTheme, example: UserTheme.DARK })
  @IsOptional()
  @IsEnum(UserTheme)
  theme?: UserTheme;

  @ApiPropertyOptional({ enum: UserLanguage, example: UserLanguage.PT_BR })
  @IsOptional()
  @IsEnum(UserLanguage)
  language?: UserLanguage;

  @ApiPropertyOptional({ enum: UserTimeFormat, example: UserTimeFormat.H24 })
  @IsOptional()
  @IsEnum(UserTimeFormat)
  timeFormat?: UserTimeFormat;

  @ApiPropertyOptional({ example: 'America/Sao_Paulo' })
  @IsOptional()
  @IsString()
  timezone?: string;
}
