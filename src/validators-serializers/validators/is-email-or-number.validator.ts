import {
  isEmail,
  isPhoneNumber,
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

@ValidatorConstraint()
class IsEmailOrNumberConstraint implements ValidatorConstraintInterface {
  validate(value: string, args: ValidationArguments): boolean {
    const isNumber = new RegExp(/^\+\d+$/).test(value);
    return isNumber ? isPhoneNumber(value, null) : isEmail(value);
  }

  defaultMessage(args: ValidationArguments): string {
    return `field ${args.property} must be a valid email or phone number.`;
  }

}

export function IsEmailOrNumber(validationOptions?: ValidationOptions) {
  return (object: Object, propertyName: string) => {
    registerDecorator({
      target: object.constructor,
      propertyName,
      options: validationOptions,
      validator: IsEmailOrNumberConstraint,
    });
  };
}