import { VerifyNumberDto } from './dto/verify-number.dto';
import { CustomRequest } from './../shared/interfaces/custom-request.interface';
import { Body, Controller, HttpCode, Post, Req, UseGuards } from '@nestjs/common';
import { EmailShouldBeVerifiedGuard } from 'src/shared/guards/email-shouldbe-verified.guard';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { ResendEmailVerificationCodeDto } from './dto/resend_email_verificationcode.dto';
import { SendNumberVerificationCodeDto } from './dto/send_phone_verificationcode.dto';
import { SignupDto } from './dto/signup.dto';
import { VerifyEmailDto } from './dto/verify-account.dto';

@Controller('auth')
export class AuthController {

    constructor(private authService: AuthService) { }

    @Post('signup')
    async signup(@Body() signupDto: SignupDto) { 
        return await this.authService.createUser(signupDto);
    }

    @Post('verify-email')
    @HttpCode(200)
    verifyEmail(
        @Body() verifyEmailDto: VerifyEmailDto
    ) { 
        return this.authService.verifyEmail(verifyEmailDto);
    }

    @Post('login')
    @HttpCode(200)
    loginUser(
        @Body() loginDto: LoginDto
    ) {
        return this.authService.login(loginDto);
    }


    @Post('resend-email-verification-code')
    @HttpCode(200)
    resendEmailVerificationCode(
        @Body() resendEmailVerificationCodeDto: ResendEmailVerificationCodeDto
        ) { 
        return this.authService.resendEmailVerificationCode(resendEmailVerificationCodeDto);
    }
    
    @Post('send-number-verification-code')
    @UseGuards(EmailShouldBeVerifiedGuard)
    @HttpCode(200)
    sendPhoneVerificationCode(
        @Req() req: CustomRequest,
        @Body() sendPhoneVerificationCodeDto: SendNumberVerificationCodeDto
    ) { 
        return this.authService.requestPhoneVerificationCode(req, sendPhoneVerificationCodeDto);
    }

    @Post('verify-number')
    @UseGuards(EmailShouldBeVerifiedGuard)
    @HttpCode(200)
    verifyNumber(
        @Req() req: CustomRequest,
        @Body() verifyNumberDto: VerifyNumberDto
        ) { 
            return this.authService.verifyPhoneNumber(req, verifyNumberDto);
    }

}
