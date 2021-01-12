import { UserPhoneNumber, UserPhoneObject } from '../interfaces/user-phone.interface';
import { parsePhoneNumberFromString, PhoneNumber } from 'libphonenumber-js';
import { NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User } from '../models/User.model';
import { Model } from 'mongoose';
import { UserEmail } from '../interfaces/user.email.interface';

export class CommonUserService {

  constructor(@InjectModel(User.name) private readonly User: Model<User>) {
  }

  generateUserPhoneFromParsedNum(phoneNumber: PhoneNumber): UserPhoneObject {
    return {
      countryCode: `+${phoneNumber.countryCallingCode}`,
      number: phoneNumber.formatInternational().toString(),
    };
  }

  generateEmailOrNumberFilter(emailOrNumber: string): { phone: UserPhoneObject } | { email: string } {
    const isNumber = RegExp(/^\+\d+$/).test(emailOrNumber);
    if (isNumber)
      return {
        phone: this.generateUserPhoneFromParsedNum(parsePhoneNumberFromString(emailOrNumber)),
      };

    return { email: emailOrNumber };
  }

  async findUserByEmailOrNumber(emailOrNumber: string): Promise<User> {
    const filter = this.generateEmailOrNumberFilter(emailOrNumber);
    const user = await this.User.findOne(filter);
    if (!user)
      throw new NotFoundException(`User does not exists anymore, this is all we know :(`);

    return user;
  }

  async findUserByNumber(number: PhoneNumber, shouldBeVerified = false, errorMsg?: string) {
    const filter: UserPhoneNumber = { phone: this.generateUserPhoneFromParsedNum(number) };
    if (shouldBeVerified)
      filter.numberVerified = true;

    const user = await this.User.findOne(filter);
    if (!user)
      throw new NotFoundException(errorMsg || `User does not exists anymore, this is all we know :(`);

    return user;
  }

  async findUserByEmail(email: string, shouldBeVerified = false, errorMsg?: string): Promise<User> {
    const filter: UserEmail = { email };
    if (shouldBeVerified)
      filter.emailVerified = true;

    const user = await this.User.findOne(filter);
    if (!user)
      throw new NotFoundException(errorMsg || `User does not exists anymore, this is all we know :(`);

    return user;
  }
}