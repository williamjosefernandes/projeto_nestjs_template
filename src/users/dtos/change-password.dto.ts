import { IsString, IsNotEmpty, MinLength, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { MatchDecorator } from '../../common/decorators/match.decorator';

export class ChangePasswordDto {
  @ApiProperty({ example: 'SenhaAtual@123' })
  @IsNotEmpty()
  @IsString()
  currentPassword!: string;

  @ApiProperty({ example: 'NovaSenha#2026' })
  @IsNotEmpty()
  @IsString()
  @MinLength(8)
  @Matches(/((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, {
    message:
      'A senha deve conter ao menos 1 letra maiúscula, 1 minúscula e 1 número ou caractere especial',
  })
  newPassword!: string;

  @ApiProperty({ example: 'NovaSenha#2026' })
  @IsNotEmpty()
  @IsString()
  @MatchDecorator('newPassword', {
    message: 'A confirmação de senha não confere.',
  })
  confirmPassword!: string;
}
