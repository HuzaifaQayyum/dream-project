import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

@ValidatorConstraint()
class IsExactLengthConstraint implements ValidatorConstraintInterface {
  validate(value: string, args: ValidationArguments): boolean {
    return value.toString().length === args.constraints[0];
  }

  defaultMessage(args: ValidationArguments): string {
    return `${args.property}'s length must be equal to ${args.constraints[0]}.`;
  }
}

export function IsExactLength(length: number, validationOptions?: ValidationOptions) {
  return (object: Object, propertyName: string) => {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      constraints: [length],
      options: validationOptions,
      validator: IsExactLengthConstraint,
    });
  };
}