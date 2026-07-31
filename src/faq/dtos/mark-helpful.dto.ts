import { IsBoolean, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class MarkHelpfulDto {
  @ApiProperty({ description: 'Se o usuário considerou a FAQ útil.' })
  @IsNotEmpty()
  @IsBoolean()
  isHelpful!: boolean;
}
