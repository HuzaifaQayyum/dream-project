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
import { HttpException, UnprocessableEntityException } from '@nestjs/common/exceptions';
import { LoginDto } from './dto/login.dto';
import { ResendEmailVerificationCodeDto } from './dto/resend_email_verificationcode.dto';
import { SendNumberVerificationCodeDto } from './dto/send_phone_verificationcode.dto';
import { SmsCallService } from '../shared/services/sms_call.service';
import { parsePhoneNumber } from 'libphonenumber-js';
import { BearerTokenInterface } from 'src/shared/interfaces/bearer-token-payload.interface';


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

        return { message: 'Verification Email sent.', nextStep: NextSteps.VERIFY_EMAIL };
    }

    private authenticateUser(user: User): Promise<string> {
        const payload: BearerTokenInterface = {
            _id: user._id
        };

        return this.JwtService.signAsync(payload);
    }

    async verifyEmail(verifyEmailDto: VerifyEmailDto) {
        const user = await this.User.findOne({ email: verifyEmailDto.email, emailVerified: { $ne: true } });
        if (!user) throw new HttpException('Invalid or Expired.', HttpStatus.FORBIDDEN);

        const verificationCodeMatch = await bcrypt.compare(verifyEmailDto.verificationCode, user.emailVerificationCode);
        if (!verificationCodeMatch) throw new NotFoundException('Invalid or Expired or already used code.');

        await user.set({
            userID: user._id,
            emailVerified: true,
            emailVerificationCode: undefined
        }).save()

        return this.authenticateUser(user)
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

    async login(loginDto: LoginDto) {
        const user = await this.User.findOne({ email: loginDto.email });
        if (!user) throw new UnauthorizedException('Invalid credentials');

        if (!user.emailVerified) {
            await this.sendEmailVerificationCode(user);
            return { message: 'verification mail sent', nextStep: NextSteps.VERIFY_EMAIL };
        }

        const passMatch = await bcrypt.hash(loginDto.password, user.password);
        if (!passMatch) throw new UnauthorizedException('Invalid credentials');

        return this.authenticateUser(user);
    }

    async resendEmailVerificationCode(resendEmailVerificationCodeDto: ResendEmailVerificationCodeDto) {
        const user = await this.User.findOne({ email: resendEmailVerificationCodeDto.email, emailVerified: { $ne: true } });
        if (!user)
            throw new UnprocessableEntityException('Invalid, Already used or Expired Email.');

        this.sendEmailVerificationCode(user);
        return { message: 'Check your email address.', nextStep: NextSteps.VERIFY_EMAIL };
    }

    private async sendVerificationCodetoPhone(user: User) {
        const number = parsePhoneNumber(user.phone.countryCode + user.phone.number);
        const verificationCode = this.generateVerificationCode().toString();

        await user.set({
            numberVerificationCode: await bcrypt.hash(verificationCode, 12)
        }).save();

        this.smsCallService.sendMessage({
            from: '+12025195818',
            to: number.formatInternational(),
            body: `Your verification code is ${verificationCode}`
        });
    }

    async requestPhoneVerificationCode(req: CustomRequest, sendPhoneVerificationCodeDto: SendNumberVerificationCodeDto) {
        const number = parsePhoneNumber(sendPhoneVerificationCodeDto.number);
        const { user } = req;

        await user.set({
            phone: {
                countryCode: `+${number.countryCallingCode}`,
                number: number.nationalNumber
            }
        }).save();

        this.sendVerificationCodetoPhone(user);

        return { message: 'check your phone number', nextStep: NextSteps.VERIFY_NUMBER };
    }

    async verifyPhoneNumber(req: CustomRequest, verifyNumberDto: VerifyNumberDto) {
        const recievedNumber = parsePhoneNumber(verifyNumberDto.number);
        const { user } = req;
        const userNumber = parsePhoneNumber(user.phone.countryCode + user.phone.number);

        if (!
            (userNumber.toString() === recievedNumber.toString())
        )
            throw new UnprocessableEntityException('Phone number does not match.');

        const verificationCodeMatch = await bcrypt.compare(verifyNumberDto.verificationCode, user.numberVerificationCode);
        if (!verificationCodeMatch) throw new NotFoundException('Expired or already used verfication code.');

        await user.set({
            numberVerified: true,
            numberVerificationCode: undefined
        }).save();

        return { message: 'number verified.' };
    }

}
