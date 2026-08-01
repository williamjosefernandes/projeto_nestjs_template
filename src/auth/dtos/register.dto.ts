import { IsEmail, IsIn, IsNotEmpty, IsString, Matches, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { AccountType } from '@prisma/client';

export class RegisterDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  firstName!: string;

  @ApiProperty({ required: false })
  @IsString()
  lastName?: string;

  @ApiProperty()
  @IsEmail()
  @IsNotEmpty()
  email!: string;

  @ApiProperty({
    description:
      'Mínimo 8 caracteres, com ao menos 1 maiúscula, 1 minúscula, 1 número e 1 caractere especial.',
  })
  @MinLength(8)
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/, {
    message:
      'A senha deve conter ao menos 1 letra maiúscula, 1 minúscula, 1 número e 1 caractere especial (@$!%*?&).',
  })
  @IsNotEmpty()
  password!: string;

  @ApiProperty({
    enum: [AccountType.CUSTOMER, AccountType.COMPANY],
    description: 'Tipo de conta a criar no onboarding — escolhido no Step 0 do wizard de cadastro.',
  })
  @IsIn([AccountType.CUSTOMER, AccountType.COMPANY], {
    message: 'accountType deve ser CUSTOMER ou COMPANY.',
  })
  accountType!: Exclude<AccountType, typeof AccountType.SYSTEM>;
}
