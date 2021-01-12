import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

@ValidatorConstraint()
class IsNotBlankConstraint implements ValidatorConstraintInterface {
  validate(value: string, args: ValidationArguments): boolean {
    return Boolean(value?.toString().trim());
  }

  defaultMessage(args: ValidationArguments): string {
    return `Field {${args.property}} can not be empty.`;
  }
}

export function IsNotBlank(validationOptions?: ValidationOptions) {
  return (object: Object, propertyName: string) => {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: IsNotBlankConstraint,
    });
  };
}