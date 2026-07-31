import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class FaqResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  question!: string;

  @ApiProperty()
  answer!: string;

  @ApiPropertyOptional({ nullable: true })
  category!: string | null;

  @ApiProperty()
  views!: number;

  @ApiProperty()
  helpful!: number;

  @ApiProperty()
  notHelpful!: number;

  @ApiProperty()
  isActive!: boolean;

  @ApiProperty()
  order!: number;

  @ApiProperty()
  createdAt!: Date;

  @ApiProperty()
  updatedAt!: Date;
}
