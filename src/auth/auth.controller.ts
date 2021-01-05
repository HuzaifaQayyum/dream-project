import { ShouldBeNumberSetGuard } from './../shared/guards/shouldbe-numberset.guard';
import { Body, Controller, HttpCode, Post, Req, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { SendNumberVerificationCodeDto } from './dto/send_phone_verificationcode.dto';
import { SignupDto } from './dto/signup.dto';
import { VerifyNumberDto } from './dto/verify-number.dto';
import { VerifyEmailDto } from './dto/verify-account.dto';
import { CustomRequest } from './../shared/interfaces/custom-request.interface';
import { ShouldNotBeLoggedInGuard } from 'src/shared/guards/shouldnotbe-loggedin.guard';
import { ShouldBeLoggedInGuard } from './../shared/guards/shouldbe-loggedin.guard';
import { ShouldBeEmailVerifiedGuard } from '../shared/guards/shouldbe-emailverified.guard';
import { ShouldNotBeNumberVerifiedGuard } from 'src/shared/guards/shouldnotbe-numberverified.guard';

@Controller('auth')
export class AuthController {

    constructor(private authService: AuthService) { }

    @Post('signup')
    @UseGuards(ShouldNotBeLoggedInGuard)
    async signup(@Body() signupDto: SignupDto) {
        return await this.authService.createUser(signupDto);
    }

    @Post('resend-email-verification-code')
    @UseGuards(ShouldBeLoggedInGuard)
    @HttpCode(200)
    resendEmailVerificationCode(
        @Req() request: CustomRequest
    ) {
        return this.authService.resendEmailVerificationCode(request);
    }

    @Post('verify-email')
    @UseGuards(ShouldBeLoggedInGuard)
    @HttpCode(200)
    verifyEmail(
        @Req() request: CustomRequest,
        @Body() verifyEmailDto: VerifyEmailDto
    ) {
        return this.authService.verifyEmail(request, verifyEmailDto);
    }

    @Post('send-number-verification-code')
    @UseGuards(ShouldBeEmailVerifiedGuard, ShouldNotBeNumberVerifiedGuard)
    @HttpCode(200)
    sendPhoneVerificationCode(
        @Req() req: CustomRequest,
        @Body() sendPhoneVerificationCodeDto: SendNumberVerificationCodeDto
    ) {
        return this.authService.requestPhoneVerificationCode(req, sendPhoneVerificationCodeDto);
    }

    @Post('verify-number')
    @UseGuards(ShouldBeEmailVerifiedGuard, ShouldBeNumberSetGuard, ShouldNotBeNumberVerifiedGuard)
    @HttpCode(200)
    verifyNumber(
        @Req() req: CustomRequest,
        @Body() verifyNumberDto: VerifyNumberDto
    ) {
        return this.authService.verifyPhoneNumber(req, verifyNumberDto);
    }

    @Post('login')
    @UseGuards(ShouldNotBeLoggedInGuard)
    @HttpCode(200)
    loginUser(
        @Body() loginDto: LoginDto
    ) {
        return this.authService.login(loginDto);
    }

}
