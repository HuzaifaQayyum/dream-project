import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { parsePhoneNumberFromString } from 'libphonenumber-js';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { User } from '../models/User.model';

import { EncryptionService } from '../../encryption/encryption.service';
import { CommonUserService } from './common.service';
import { SmsCallService } from '../../shared/sms-call/sms-call.service';

import { PasswordResetPossibleOptions } from '../interfaces/password-reset-possible-options.interface';
import { MessageResponse } from '../../auth/interfaces/message-response.interface';

import { EmailOrNumberDto } from '../dto/email-or-number.dto';
import { NumberDto } from '../dto/number.dto';
import { EmailDto } from '../dto/email.dto';
import { ChangePasswordDto } from '../dto/change-password.dto';

import generateVerificationCode from '../../utils/generate-verification-code.util';
import { VerificationCodeDto } from '../dto/verification-code.dto';
import { ValidatePasswordResetCodeDto } from '../dto/validate-password-reset-code.dto';

@Injectable()
export class ForgotPasswordService {

  constructor(
    private commonUserService: CommonUserService,
    private encryptionService: EncryptionService,
    private mailerService: MailerService,
    private smsCallService: SmsCallService,
    @InjectModel(User.name) private readonly User: Model<User>) {
  }


  private async setPasswordResetCode(user: User): Promise<string> {
    const passwordResetCode = generateVerificationCode();
    await user.set({
      passwordResetCode: await this.encryptionService.hash(passwordResetCode),
    }).save();

    return passwordResetCode;
  }

  private sendPasswordResetCodeToEmail(userEmail: string, passwordResetCode: string): void {
    this.mailerService.sendMail({
      from: 'forgetpassword@pockerteam.com',
      to: userEmail,
      text: `Verification Code for password reset is ${passwordResetCode}`,
    });
  }

  private sendPasswordResetCodeToNumber(userNumber: string, passwordResetCode: string): void {
    this.smsCallService.sendMessage({
      to: userNumber,
      body: `Verification Code for password reset is ${passwordResetCode}`,
    });
  }

  private async markUserPasswordResettable(user: User): Promise<void> {
    await user.set({
      passwordResetCode: undefined,
      canSetPassword: true,
    }).save();
  }

  private async setUserNewPassword(user: User, newPassword: string) {
    await user.set({
      password: await this.encryptionService.hash(newPassword),
      canResetPassword: undefined,
    }).save();
  }

  async getPossiblePasswordReset(emailOrNumberDto: EmailOrNumberDto) {
    const user = await this.commonUserService.findUserByEmailOrNumber(emailOrNumberDto.emailOrNumber);

    const availablePasswordResetOptions: PasswordResetPossibleOptions = {};
    if (user.emailVerified)
      availablePasswordResetOptions.email = user.email;
    if (user.numberVerified)
      availablePasswordResetOptions.phone = user.phone.countryCode + user.phone.number;

    return availablePasswordResetOptions;
  }

  async mailPasswordResetCode(emailDto: EmailDto): Promise<void> {
    const user = await this.commonUserService.findUserByEmail(emailDto.email, true);
    const passwordResetCode = await this.setPasswordResetCode(user);
    this.sendPasswordResetCodeToEmail(user.email, passwordResetCode);
  }

  async smsPasswordResetCode(numberDto: NumberDto): Promise<void> {
    const number = parsePhoneNumberFromString(numberDto.number);

    const user = await this.commonUserService.findUserByNumber(number, true);
    const passwordResetCode = await this.setPasswordResetCode(user);
    this.sendPasswordResetCodeToNumber(number.formatInternational().toString(), passwordResetCode);
  }

  async validatePasswordResetCode(validatePasswordResetCodeDto: ValidatePasswordResetCodeDto): Promise<User> {
    const user = await this.commonUserService.findUserByEmailOrNumber(validatePasswordResetCodeDto.emailOrNumber);
    if (!user.passwordResetCode)
        throw new ForbiddenException(`Invalid, already used or expired code.`);

    const verificationCodeMatch = await this.encryptionService.compare(validatePasswordResetCodeDto.verificationCode, user.passwordResetCode);
    if (!verificationCodeMatch)
      throw new NotFoundException('Invalid, already used or expired code. This is all we know :(');

    await this.markUserPasswordResettable(user);

    return user;
  }

  async changePassword(user: User, newPasswordDto: ChangePasswordDto): Promise<void> {
    if (!user.canResetPassword)
      throw new ForbiddenException(`You are not allowed anymore to change password.`);

    await this.setUserNewPassword(user, newPasswordDto.newPassword);
  }

}