import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

@ValidatorConstraint()
class SameValueConstraint implements ValidatorConstraintInterface {
  validate(value: string, args: ValidationArguments): boolean {
    const compareTo = args.constraints[0];
    return value.toString() === args.object[compareTo].toString();
  }

  defaultMessage(args: ValidationArguments): string {
    return `${args.property} must be same as ${args.constraints[0]}`;
  }
}

export function SameValue(compareTo: string, validationOptions?: ValidationOptions) {
  return (object: Object, propertyName: string) => {
    registerDecorator({
      propertyName,
      target: object.constructor,
      constraints: [compareTo],
      options: validationOptions,
      validator: SameValueConstraint,
    });
  };
}