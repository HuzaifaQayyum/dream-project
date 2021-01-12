import { ForbiddenException, Injectable } from '@nestjs/common';
import { CreateUserDto } from '../user/dto/create-user.dto';
import { SignupLoginService } from '../user/services/signup-login.service';
import { User } from '../user/models/User.model';
import { JwtService } from '@nestjs/jwt';
import { BearerTokenPayloadInterface } from './interfaces/bearer-token-payload.interface';
import { AuthenticationResponse } from './interfaces/authentication-response.interface';
import { MessageResponse } from './interfaces/message-response.interface';
import { VerificationCodeDto } from '../user/dto/verification-code.dto';
import { UserNumberService } from '../user/services/user-number.service';
import { NumberDto } from '../user/dto/number.dto';
import { ForgotPasswordService } from '../user/services/forgot-password.service';
import { EmailOrNumberDto } from '../user/dto/email-or-number.dto';
import { EmailDto } from '../user/dto/email.dto';
import { PasswordResetPossibleOptions } from '../user/interfaces/password-reset-possible-options.interface';
import { ValidatePasswordResetCodeDto } from '../user/dto/validate-password-reset-code.dto';
import { ChangePasswordDto } from '../user/dto/change-password.dto';
import { LoginDto } from '../user/dto/login.dto';
import { InvalidCredentialsException } from '../user/exceptions/invalid-credentials.exception';
import { EmailNotVerifiedException } from '../user/exceptions/email-not-verified.exception';

@Injectable()
export class AuthService {

  constructor(
    private readonly signupLoginService: SignupLoginService,
    private readonly numberVerificationService: UserNumberService,
    private readonly forgotPasswordService: ForgotPasswordService,
    private jwtService: JwtService
    ) {
  }

  private async authenticateUser(user: User, extraProps?: MessageResponse | {[key: string]: any}, payload: BearerTokenPayloadInterface={ _id: user._id }): Promise<AuthenticationResponse> {

    return {
      ...extraProps,
      token: await this.jwtService.signAsync(payload),
      emailVerified: user.emailVerified || false,
      numberVerified: user.numberVerified || false
    };
  }

  async signup(createUserDto: CreateUserDto) {
    const user = await this.signupLoginService.createNewUser(createUserDto);
    return this.authenticateUser(user, { message: `Email verification code sent, please verify your account first.` });
  }

  async login(loginDto: LoginDto): Promise<AuthenticationResponse> {
    let user: User;
    try {
      user = await this.signupLoginService.login(loginDto);
    } catch (e) {
      if (e instanceof InvalidCredentialsException)
        throw new ForbiddenException(`Invalid Login credentials received`);
      else if(e instanceof EmailNotVerifiedException)
        return this.authenticateUser(user, { message: `Email verification code sent, please verify your account first.` });
    }

    return this.authenticateUser(user);
  }

  async resendEmailVerificationCode(user: User): Promise<MessageResponse> {
    await this.signupLoginService.resendEmailVerificationCode(user);
    return { message: `Email verification code resent to your email inbox.` };
  }

  async verifyEmail(user: User, verificationCodeDto: VerificationCodeDto) {
    await this.signupLoginService.verifyEmail(user, verificationCodeDto);
    return this.authenticateUser(user);
  }

  async setUserNumber(user: User, numberDto: NumberDto): Promise<MessageResponse> {
    await this.numberVerificationService.setUserPhoneNumber(user, numberDto);
    return { message: `Number verification code sent to your number` };
  }

  async verifyNumber(user: User, verificationCodeDto): Promise<MessageResponse> {
    await this.numberVerificationService.verifyUserNumber(user, verificationCodeDto);
    return { message: `Number verified successfully.` };
  }

  async getAvailablePasswordResetOptions(emailOrNumberDto: EmailOrNumberDto): Promise<PasswordResetPossibleOptions> {
    const availablePasswordResetOptions = await this.forgotPasswordService.getPossiblePasswordReset(emailOrNumberDto);
    if (JSON.stringify(availablePasswordResetOptions) === '{}')
      throw new ForbiddenException(`Unfortunately, there is nothing which can assist you in recovering your forgotten password.`);

    return availablePasswordResetOptions;
  }

  async mailPasswordResetCode(emailDto: EmailDto): Promise<MessageResponse> {
    await this.forgotPasswordService.mailPasswordResetCode(emailDto);
    return { message: `Password reset code sent to your email inbox.` };
  }

  async smsPasswordResetCode(numberDto: NumberDto): Promise<MessageResponse> {
    await this.forgotPasswordService.smsPasswordResetCode(numberDto);
    return { message: `Password reset code sent to your number.` };
  }

  async validatePasswordResetCode(validatePasswordResetCodeDto: ValidatePasswordResetCodeDto) {
    const user = await this.forgotPasswordService.validatePasswordResetCode(validatePasswordResetCodeDto);
    return this.authenticateUser(user, { }, { _id: user._id, loginPrevented: true });
  }

  async changePassword(user: User, newPasswordDto: ChangePasswordDto) {
    await this.forgotPasswordService.changePassword(user, newPasswordDto);
    return this.authenticateUser(user);
  }

}
