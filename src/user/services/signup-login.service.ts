import { Injectable, NotFoundException } from '@nestjs/common';
import generateVerificationCode from '../../utils/generate-verification-code.util';
import { InjectModel } from '@nestjs/mongoose';
import { EncryptionService } from '../../encryption/encryption.service';
import { Model } from 'mongoose';
import { CreateUserDto } from '../dto/create-user.dto';
import { User } from '../models/User.model';
import { MailerService } from '@nestjs-modules/mailer';
import { VerificationCodeDto } from '../dto/verification-code.dto';
import { LoginDto } from '../dto/login.dto';
import { CommonUserService } from './common.service';
import { MessageResponse } from '../../auth/interfaces/message-response.interface';
import { EmailNotVerifiedException } from '../exceptions/email-not-verified.exception';
import { InvalidCredentialsException } from '../exceptions/invalid-credentials.exception';

@Injectable()
export class SignupLoginService {

  constructor(
    @InjectModel(User.name) private readonly User: Model<User>,
    private readonly encryptionService: EncryptionService,
    private readonly mailerService: MailerService,
    private readonly commonUserService: CommonUserService
  ) {
  }

  private mailEmailVerificationCode(userEmail: string, verificationCode?: string) {
    const emailVerificationCode = verificationCode || generateVerificationCode();

    this.mailerService.sendMail({
      to: userEmail,
      from: 'pocker@gmail.com',
      text: `Your email verification code is ${verificationCode}`,
    });
  }

  private async markUserEmailAsVerified(user: User): Promise<void> {
    await user.set({
      emailVerified: true,
      emailVerificationCode: undefined,
    }).save();
  }

  async createNewUser(createUserDto: CreateUserDto) {
    const emailVerificationCode = generateVerificationCode();
    const user = new this.User({
      username: createUserDto.username,
      email: createUserDto.email,
      password: await this.encryptionService.hash(createUserDto.password),
      emailVerificationCode: await this.encryptionService.hash(emailVerificationCode),
    });
    await user.save();

    await this.mailEmailVerificationCode(user.email);
    return user;
  }

  async resendEmailVerificationCode(user: User): Promise<void> {
    const emailVerificationCode = generateVerificationCode();
    await user.set({
      emailVerificationCode: await this.encryptionService.hash(emailVerificationCode),
    }).save();
    this.mailEmailVerificationCode(user.email, emailVerificationCode);
  }

  async verifyEmail(user: User, verificationCodeDto: VerificationCodeDto): Promise<void> {
    const emailVerificationCodeMatch = await this.encryptionService.compare(verificationCodeDto.verificationCode, user.emailVerificationCode);
    if (!emailVerificationCodeMatch)
      throw new NotFoundException(`Invalid, expired or already used email verification code.`);

    await this.markUserEmailAsVerified(user);
  }

  async login(loginDto: LoginDto): Promise<User> {
    const user = await this.commonUserService.findUserByEmailOrNumber(loginDto.emailOrNumber);
    if (!user.emailVerified) {
      await this.resendEmailVerificationCode(user);
      throw new EmailNotVerifiedException();
    }

    const passwordMatch = await this.encryptionService.compare(loginDto.password, user.password);
    if (!passwordMatch)
      throw new InvalidCredentialsException();

    return user;
  }
}
