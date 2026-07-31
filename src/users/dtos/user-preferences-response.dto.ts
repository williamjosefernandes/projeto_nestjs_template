import { ApiProperty } from '@nestjs/swagger';
import {
  UserTheme,
  UserLanguage,
  UserTimeFormat,
} from './user-preference.enums';

export class UserPreferencesResponseDto {
  @ApiProperty({ enum: UserTheme })
  theme!: UserTheme;

  @ApiProperty({ enum: UserLanguage })
  language!: UserLanguage;

  @ApiProperty()
  timezone!: string;

  @ApiProperty({ enum: UserTimeFormat })
  timeFormat!: UserTimeFormat;
}
