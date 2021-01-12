import { Injectable, NotFoundException } from '@nestjs/common';
import { User } from '../models/User.model';
import parsePhoneNumberFromString, { PhoneNumber } from 'libphonenumber-js';
import generateVerificationCode from '../../utils/generate-verification-code.util';
import { EncryptionService } from '../../encryption/encryption.service';
import { VerificationCodeDto } from '../dto/verification-code.dto';
import { NumberDto } from '../dto/number.dto';
import { SmsCallService } from '../../shared/sms-call/sms-call.service';

@Injectable()
export class UserNumberService {

  constructor(
    private readonly encryptionService: EncryptionService,
    private readonly smsCallService: SmsCallService
    ) {
  }

  private smsNumberVerificationCode(userNumber: string, numberVerificationCode: string) {
    this.smsCallService.sendMessage({
      to: userNumber,
      body: `Verification Code for password reset is ${numberVerificationCode}`,
    });
  }

  private async setNumberAndVerificationCode(user: User, number: PhoneNumber, numberVerificationCode: string) {
    await user.set({
      numberVerificationCode: this.encryptionService.hash(numberVerificationCode),
      phone: {
        countryCode: `+${number.countryCallingCode}`,
        number: number.formatInternational().toString(),
      },
    }).save();
  }

  private async markNumberAsVerified(user: User): Promise<void> {
    await user.set({
      numberVerified: true,
      numberVerificationCode: undefined,
    }).save();
  }


  async setUserPhoneNumber(user: User, numberDto: NumberDto): Promise<string> {
    const phoneNumber = parsePhoneNumberFromString(numberDto.number);
    const numberVerificationCode = generateVerificationCode();

    await this.setNumberAndVerificationCode(user, phoneNumber, numberVerificationCode);
    this.smsNumberVerificationCode(phoneNumber.formatInternational().toString(), numberVerificationCode);

    return numberVerificationCode;
  }

  async verifyUserNumber(user: User, verificationCodeDto: VerificationCodeDto): Promise<void> {
    const verificationCodeMatch = await this.encryptionService.compare(verificationCodeDto.verificationCode, user.numberVerificationCode);
    if (!verificationCodeMatch)
      throw new NotFoundException(`Invalid, expired or already used code.`);
    await this.markNumberAsVerified(user);
  }
}