// import { parsePhoneNumberFromString } from 'libphonenumber-js';
// import { Model } from 'mongoose';
// import { User } from '../../shared/models/User.model';
// import { Injectable } from "@nestjs/common";
// import { registerDecorator, ValidationArguments, ValidationOptions, ValidatorConstraint, ValidatorConstraintInterface } from "class-validator";
// import { InjectModel } from '@nestjs/mongoose';
//
// @ValidatorConstraint({ async: true })
// @Injectable()
// export class IsNumberUniqueConstraint implements ValidatorConstraintInterface {
//
//     constructor(
//         @InjectModel(User.name) private readonly User: Model<User>
//     ) { }
//
//     validate(value: string, args: ValidationArguments): Promise<boolean> {
//         const parsedNumber = parsePhoneNumberFromString(value);
//         return this.User.exists({
//             phone: {
//                 countryCode: `+${parsedNumber.countryCallingCode.toString()}`,
//                 number: parsedNumber.formatInternational().toString()
//             }
//          });
//     }
//
//     defaultMessage(args: ValidationArguments): string {
//         return `This phone number is already used to verify a different account.`;
//     }
// }
//
// export function IsNumberUnique(validationOptions?: ValidationOptions) {
//     return (object: Object, propertyName: string) => {
//         registerDecorator({
//             target: object.constructor,
//             propertyName,
//             options: validationOptions,
//             validator: IsNumberUniqueConstraint
//         });
//     }
// }