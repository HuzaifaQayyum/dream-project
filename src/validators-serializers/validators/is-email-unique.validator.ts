import { Model } from 'mongoose';
import { Injectable } from '@nestjs/common';
import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { InjectModel } from '@nestjs/mongoose';
import { User } from '../../user/models/User.model';

@ValidatorConstraint({ async: true })
@Injectable()
export class IsEmailUniqueConstraint implements ValidatorConstraintInterface {

  constructor(
    @InjectModel(User.name) private readonly User: Model<User>,
  ) {
  }

  async validate(value: string, args: ValidationArguments): Promise<boolean> {
    return !(await this.User.exists({ email: value }));
  }

  defaultMessage(args: ValidationArguments): string {
    return `${args.property} already exists.`;
  }

}

export function IsEmailUnique(validationOptions?: ValidationOptions) {
  return (object: Object, propertyName: string) => {
    registerDecorator({
      target: object.constructor,
      propertyName,
      options: validationOptions,
      validator: IsEmailUniqueConstraint,
    });
  };
}