import { VerifyNumberDto } from './dto/verify-number.dto';
import { CustomRequest } from './../shared/interfaces/custom-request.interface';
import { HttpStatus, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { SignupDto } from './dto/signup.dto';
import { User } from '../shared/models/User.model';
import { MailerService } from '@nestjs-modules/mailer';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { VerifyEmailDto } from './dto/verify-account.dto';
import { ForbiddenException, HttpException, UnprocessableEntityException } from '@nestjs/common/exceptions';
import { LoginDto } from './dto/login.dto';
import { SendNumberVerificationCodeDto } from './dto/send_phone_verificationcode.dto';
import { SmsCallService } from '../shared/services/sms_call.service';
import { parsePhoneNumber, PhoneNumber } from 'libphonenumber-js';
import { BearerTokenInterface } from 'src/shared/interfaces/bearer-token-payload.interface';
import { AuthenticatedResponse, ExtraResponseProps, MessageResponse } from './interfaces/responses.interface';


export enum NextSteps {
    VERIFY_EMAIL = 0,
    VERIFY_NUMBER = 1
}


// TODO: Avoid verification code Bruetforce. Lock attempts after 5 for 24hrs.
// TODO: Resend Phone number verification code
@Injectable()
export class AuthService {

    constructor(
        @InjectModel(User.name) private readonly User: Model<User>,
        private readonly JwtService: JwtService,
        private readonly mailerService: MailerService,
        private readonly smsCallService: SmsCallService) { }


    private async authenticateUser(user: User, props?: ExtraResponseProps): Promise<AuthenticatedResponse> {
        const payload: BearerTokenInterface = {
            _id: user._id
        };

        const response: AuthenticatedResponse = {
            ...props,
            emailVerified: user.emailVerified || false,
            numberVerified: user.numberVerified || false,
            token: await this.JwtService.signAsync(payload)
        };

        return response;
    }

    private async sendEmailVerificationCode(user: User): Promise<void> {
        const verificationCode = this.generateVerificationCode().toString();
        await user.set({
            emailVerificationCode: await bcrypt.hash(verificationCode, 12)
        }).save();

        this.mailerService.sendMail({
            from: 'procker@admin.com',
            to: user.email,
            text: `verification code is ${verificationCode}.`
        });
    }

    private generateVerificationCode() {
        return Math.floor(100000 + Math.random() * 900000);
    }

    async createUser(signupDto: SignupDto) {
        const user = new this.User({
            username: signupDto.username,
            email: signupDto.email,
            password: await bcrypt.hash(signupDto.password, 12),
        });
        await user.save();

        await this.sendEmailVerificationCode(user);

        return this.authenticateUser(user, { nextStep: NextSteps.VERIFY_EMAIL, message: 'Verification Email sent.' });
    }

    resendEmailVerificationCode(request: CustomRequest): MessageResponse {
        const { user } = request;

        this.sendEmailVerificationCode(user);
        return { message: 'Check your email address.', nextStep: NextSteps.VERIFY_EMAIL };
    }

    async verifyEmail(request: CustomRequest, verifyEmailDto: VerifyEmailDto) {
        const { user } = request;

        const verificationCodeMatch = await bcrypt.compare(verifyEmailDto.verificationCode, user.emailVerificationCode);
        if (!verificationCodeMatch) throw new NotFoundException('Invalid,Expired or already used code.');

        await user.set({
            emailVerified: true,
            emailVerificationCode: undefined
        }).save()

        return this.authenticateUser(user)
    }


    async login(loginDto: LoginDto) {
        const user = await this.User.findOne({ email: loginDto.email });
        if (!user) throw new UnauthorizedException('Invalid credentials');

        if (!user.emailVerified) {
            await this.sendEmailVerificationCode(user);
            return this.authenticateUser(user, { nextStep: NextSteps.VERIFY_EMAIL, message: 'Check your email for verification code.' });
        }

        const passMatch = await bcrypt.hash(loginDto.password, user.password);
        if (!passMatch) throw new UnauthorizedException('Invalid credentials');

        return this.authenticateUser(user);
    }


    private async sendVerificationCodetoPhone(user: User, number: PhoneNumber, saveUser = false) {
        let verificationCode = this.generateVerificationCode().toString();
        while (await bcrypt.compare(verificationCode, user.numberVerificationCode))
            verificationCode = this.generateVerificationCode().toString();

        user.set({
            phone: {
                countryCode: `+${number.countryCallingCode}`,
                number: number.nationalNumber.toString()
            },
            numberVerificationCode: await bcrypt.hash(verificationCode, 12)
        });
        if (saveUser)
            await user.save();

        this.smsCallService.sendMessage({
            from: '+12025195818',
            to: number.formatInternational(),
            body: `Your verification code is ${verificationCode}`
        }).catch(e => console.log(e));
    }

    async requestPhoneVerificationCode(req: CustomRequest, sendPhoneVerificationCodeDto: SendNumberVerificationCodeDto) {
        const { user } = req;
        const recievedNumber = parsePhoneNumber(sendPhoneVerificationCodeDto.number);

        const numberAlreadyUsed = await this.User.exists({
            _id: { $ne: user._id },
            phone: {
                countryCode: '+' + recievedNumber.countryCallingCode,
                number: recievedNumber.nationalNumber.toString()
            }
        });
        if (numberAlreadyUsed)
            throw new UnprocessableEntityException(`Number already used to verify a different account.`);

        await this.sendVerificationCodetoPhone(user, recievedNumber, true);

        return { nextStep: NextSteps.VERIFY_NUMBER, message: 'Verification code sent to your number.' };
    }


    async verifyPhoneNumber(req: CustomRequest, verifyNumberDto: VerifyNumberDto) {
        const { user } = req;

        const verificationCodeMatch = await bcrypt.compare(verifyNumberDto.verificationCode, user.numberVerificationCode);
        if (!verificationCodeMatch) throw new NotFoundException('Expired or already used verfication code.');

        await user.set({
            numberVerified: true,
            numberVerificationCode: undefined
        }).save();

        return this.authenticateUser(user);
    }
}
