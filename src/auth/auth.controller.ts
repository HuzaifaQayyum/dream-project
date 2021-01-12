import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto } from '../user/dto/create-user.dto';
import { User as UserModel } from '../user/models/User.model'
import { VerificationCodeDto } from '../user/dto/verification-code.dto';
import { NumberDto } from '../user/dto/number.dto';

@Controller('auth')
export class AuthController {

  constructor(private readonly authService: AuthService) {
  }

  @Post('signup')
  signup(
    @Body() createUserDto: CreateUserDto
  ) {
    this.authService.signup(createUserDto);
  }

  @Post('resend-email-verification-code')
  resendEmailVerificationCode(
    user: UserModel
  ) {
    return this.authService.resendEmailVerificationCode(user);
  }

  @Post('verify-email')
  verifyEmail(
    @Body() verificationCodeDto: VerificationCodeDto,
    user: UserModel
  ) {
    return this.authService.verifyEmail(user, verificationCodeDto);
  }

  @Post('set-number')
  setUserNumber(
    @Body() numberDto: NumberDto,
    user: UserModel
  ) {
    return this.authService.setUserNumber(user, numberDto);
  }

  @Post('verify-number')
  verifyNumber(
    @Body() verificationCodeDto: VerificationCodeDto,
   user: UserModel
  ) {
    return this.authService.verifyNumber(user, verificationCodeDto);
  }

}
