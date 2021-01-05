import { ShouldBeLoggedIn } from './../shared/guards/should-be-loggedin.guard';
import { VerifyNumberDto } from './dto/verify-number.dto';
import { CustomRequest } from './../shared/interfaces/custom-request.interface';
import { Body, Controller, HttpCode, Post, Req, UseGuards } from '@nestjs/common';
import { EmailShouldBeVerifiedGuard } from 'src/shared/guards/email-shouldbe-verified.guard';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { SendNumberVerificationCodeDto } from './dto/send_phone_verificationcode.dto';
import { SignupDto } from './dto/signup.dto';
import { VerifyEmailDto } from './dto/verify-account.dto';
import { NumberShouldNotbeVerified } from 'src/shared/guards/number-shouldnoybe-verfied.guard';
import { EmailShouldNotBeVerifiedGuard } from 'src/shared/guards/email-shouldnotbe-verified.guard';
import { ShouldNotbeLoggedIn } from 'src/shared/guards/should-notbe-loggedin.guard';

@Controller('auth')
export class AuthController {

    constructor(private authService: AuthService) { }

    @Post('signup')
    @UseGuards(ShouldNotbeLoggedIn)
    async signup(@Body() signupDto: SignupDto) {
        return await this.authService.createUser(signupDto);
    }

    @Post('resend-email-verification-code')
    @UseGuards(ShouldBeLoggedIn, EmailShouldNotBeVerifiedGuard)
    @HttpCode(200)
    resendEmailVerificationCode(
        @Req() request: CustomRequest
    ) {
        return this.authService.resendEmailVerificationCode(request);
    }

    @Post('verify-email')
    @UseGuards(ShouldBeLoggedIn, EmailShouldNotBeVerifiedGuard)
    @HttpCode(200)
    verifyEmail(
        @Req() request: CustomRequest,
        @Body() verifyEmailDto: VerifyEmailDto
    ) {
        return this.authService.verifyEmail(request, verifyEmailDto);
    }

    @Post('send-number-verification-code')
    @UseGuards(ShouldBeLoggedIn, EmailShouldBeVerifiedGuard, NumberShouldNotbeVerified)
    @HttpCode(200)
    sendPhoneVerificationCode(
        @Req() req: CustomRequest,
        @Body() sendPhoneVerificationCodeDto: SendNumberVerificationCodeDto
    ) {
        return this.authService.requestPhoneVerificationCode(req, sendPhoneVerificationCodeDto);
    }

    @Post('verify-number')
    @UseGuards(EmailShouldBeVerifiedGuard, NumberShouldNotbeVerified)
    @HttpCode(200)
    verifyNumber(
        @Req() req: CustomRequest,
        @Body() verifyNumberDto: VerifyNumberDto
    ) {
        return this.authService.verifyPhoneNumber(req, verifyNumberDto);
    }

    @Post('login')
    @UseGuards(ShouldNotbeLoggedIn)
    @HttpCode(200)
    loginUser(
        @Body() loginDto: LoginDto
    ) {
        return this.authService.login(loginDto);
    }

}
