import { ApiProperty } from '@nestjs/swagger';

export class SessionResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty({ required: false })
  device?: string;

  @ApiProperty({ required: false })
  os?: string;

  @ApiProperty({ required: false })
  browser?: string;

  @ApiProperty({ required: false })
  ipAddress?: string;

  @ApiProperty({ required: false })
  location?: string;

  @ApiProperty()
  loggedInAt: Date;

  @ApiProperty()
  lastAccessAt: Date;

  @ApiProperty()
  isCurrentSession: boolean;
}
