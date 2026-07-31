import { ApiProperty } from '@nestjs/swagger';

export class UserPermissionsResponseDto {
  @ApiProperty({
    type: [String],
    description: 'Códigos de permissões de API concedidas ao Membership atual.',
  })
  permissions!: string[];

  @ApiProperty({
    type: [String],
    description: 'Códigos de menus visíveis para o Membership atual.',
  })
  menus!: string[];

  @ApiProperty({
    type: [String],
    description:
      'Códigos de componentes de UI visíveis para o Membership atual.',
  })
  components!: string[];
}
