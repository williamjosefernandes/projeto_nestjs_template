import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

@ValidatorConstraint({ name: 'IsNotFutureDate' })
export class IsNotFutureDateConstraint implements ValidatorConstraintInterface {
  validate(value: unknown) {
    if (typeof value !== 'string') return false;
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return false;
    // Comparado em tempo de validação (por requisição), não em tempo de
    // decoração — `@MaxDate(() => new Date())` do class-validator não avalia
    // a função de referência corretamente (compara contra a própria função,
    // sempre inválido); por isso um constraint próprio aqui.
    return date.getTime() <= Date.now();
  }

  defaultMessage(args: ValidationArguments) {
    return `${args.property} não pode estar no futuro.`;
  }
}

export function IsNotFutureDate(validationOptions?: ValidationOptions) {
  return (object: object, propertyName: string) => {
    registerDecorator({
      target: object.constructor,
      propertyName,
      options: validationOptions,
      validator: IsNotFutureDateConstraint,
    });
  };
}
