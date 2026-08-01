import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { isValidCPF } from '../utils/br-documents.util';

@ValidatorConstraint({ name: 'IsCPF' })
export class IsCPFConstraint implements ValidatorConstraintInterface {
  validate(value: unknown) {
    return typeof value === 'string' && isValidCPF(value);
  }

  defaultMessage(args: ValidationArguments) {
    return `${args.property} deve ser um CPF válido.`;
  }
}

/** Valida CPF por dígito verificador (mod-11) — rejeita formato válido com checksum inválido. */
export function IsCPF(validationOptions?: ValidationOptions) {
  return (object: object, propertyName: string) => {
    registerDecorator({
      target: object.constructor,
      propertyName,
      options: validationOptions,
      validator: IsCPFConstraint,
    });
  };
}
