import { ApiProperty } from '@nestjs/swagger';

export class ErrorDto {
  @ApiProperty()
  code: string;

  @ApiProperty()
  message: string;
}

export class ApiResponseDto<T = any> {
  @ApiProperty()
  success: boolean;

  @ApiProperty()
  timestamp: string;

  @ApiProperty({ required: false })
  message?: string;

  @ApiProperty({ required: false })
  data?: T;

  @ApiProperty({ required: false })
  error?: ErrorDto;

  @ApiProperty({ required: false })
  requestId?: string;
}
