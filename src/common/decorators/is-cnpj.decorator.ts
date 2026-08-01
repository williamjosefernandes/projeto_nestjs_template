import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { isValidCNPJ } from '../utils/br-documents.util';

@ValidatorConstraint({ name: 'IsCNPJ' })
export class IsCNPJConstraint implements ValidatorConstraintInterface {
  validate(value: unknown) {
    return typeof value === 'string' && isValidCNPJ(value);
  }

  defaultMessage(args: ValidationArguments) {
    return `${args.property} deve ser um CNPJ válido.`;
  }
}

/** Valida CNPJ por dígito verificador (mod-11) — rejeita formato válido com checksum inválido. */
export function IsCNPJ(validationOptions?: ValidationOptions) {
  return (object: object, propertyName: string) => {
    registerDecorator({
      target: object.constructor,
      propertyName,
      options: validationOptions,
      validator: IsCNPJConstraint,
    });
  };
}
