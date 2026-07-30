import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsUUID } from 'class-validator';

export class SwitchAccountDto {
  @ApiProperty({ description: 'ID da Membership para a qual deseja alternar' })
  @IsUUID()
  @IsNotEmpty()
  membershipId: string;
}
