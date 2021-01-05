import { NumberDto } from './dto/number.dto';
import { EmailDto } from './dto/email.dto';
import { EmailOrNumberDto } from './dto/email-or-number.dto';
import { PasswordResetOption } from './interfaces/password-reset-options.interface';
import { VerifyNumberDto } from './dto/verify-number.dto';
import { CustomRequest } from './../shared/interfaces/custom-request.interface';
import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { SignupDto } from './dto/signup.dto';
import { User } from '../shared/models/User.model';
import { MailerService } from '@nestjs-modules/mailer';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { VerifyEmailDto } from './dto/verify-account.dto';
import { UnprocessableEntityException } from '@nestjs/common/exceptions';
import { LoginDto } from './dto/login.dto';
import { SmsCallService } from '../shared/services/sms_call.service';
import { parsePhoneNumberFromString, PhoneNumber } from 'libphonenumber-js';
import { BearerTokenInterface } from 'src/shared/interfaces/bearer-token-payload.interface';
import { AuthenticatedResponse, MessageResponse } from './interfaces/responses.interface';
import { UserPhone } from '../shared/interfaces/user-phone.interface';


@Injectable()
export class AuthService {

    constructor(
        @InjectModel(User.name) private readonly User: Model<User>,
        private readonly JwtService: JwtService,
        private readonly mailerService: MailerService,
        private readonly smsCallService: SmsCallService) { }


    private async authenticateUser(user: User, props?: MessageResponse): Promise<AuthenticatedResponse> {
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
        })
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

        return this.authenticateUser(user, { message: 'Verification Email sent.' });
    }

    resendEmailVerificationCode(request: CustomRequest): MessageResponse {
        const { user } = request;

        this.sendEmailVerificationCode(user);
        return { message: 'Check your email address.' };
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

    private emailOrNumberFilterForFindingUser(emailOrNumber: string): { phone: UserPhone } | { email: string } {
        const isNumber = RegExp(/^\+\d+$/).test(emailOrNumber);
        if (isNumber) {
            const number = parsePhoneNumberFromString(emailOrNumber);
            return {
                phone: {
                    countryCode: '+' + number.countryCallingCode,
                    number: number.nationalNumber.toString()
                }
            }
        }

        return { email: emailOrNumber };
    }

    async login(loginDto: LoginDto) {
        const filter = this.emailOrNumberFilterForFindingUser(loginDto.emailOrNumber);
        const user = await this.User.findOne(filter);
        if (!user)
            throw new UnauthorizedException('Invalid credentials');

        if (!user.emailVerified) {
            await this.sendEmailVerificationCode(user);
            return this.authenticateUser(user, { message: 'Check your email for verification code.' });
        }

        const passMatch = await bcrypt.hash(loginDto.password, user.password);
        if (!passMatch) throw new UnauthorizedException('Invalid credentials');

        return this.authenticateUser(user);
    }


    private async createUniqueNumVerificationCode(user: User) {
        let verificationCode = this.generateVerificationCode().toString();

        if (user.numberVerificationCode)
            while (await bcrypt.compare(verificationCode, user.numberVerificationCode))
                verificationCode = this.generateVerificationCode().toString();

        return verificationCode;
    }

    private generateUserPhoneFilter(number: PhoneNumber): UserPhone { 
        return {
            countryCode: '+' + number.countryCallingCode,
            number: number.nationalNumber.toString()
        }
    }

    private async validateNumberUniqueness(user: User, number: PhoneNumber) {
        const numberAlreadyUsed = await this.User.exists({
            _id: { $ne: user._id },
            phone: this.generateUserPhoneFilter(number)
        });
        if (numberAlreadyUsed)
            throw new UnprocessableEntityException(`Number already used to verify a different account.`);
    }

    async requestPhoneVerificationCode(req: CustomRequest, numberDto: NumberDto) {
        const { user } = req;
        const recievedNumber = parsePhoneNumberFromString(numberDto.number);
        await this.validateNumberUniqueness(user, recievedNumber);

        let verificationCode = await this.createUniqueNumVerificationCode(user);
        await user.set({
            phone: {
                countryCode: `+${recievedNumber.countryCallingCode}`,
                number: recievedNumber.nationalNumber.toString()
            },
            numberVerificationCode: await bcrypt.hash(verificationCode, 12)
        }).save();

        this.smsCallService.sendMessage({
            to: recievedNumber.formatInternational(),
            body: `Your verification code is ${verificationCode}`
        });

        return { message: 'Verification code sent to your number.' };
    }


    async verifyPhoneNumber(req: CustomRequest, verifyNumberDto: VerifyNumberDto) {
        const { user } = req;

        const verificationCodeMatch = await bcrypt.compare(verifyNumberDto.verificationCode, user.numberVerificationCode);
        if (!verificationCodeMatch)
            throw new NotFoundException('Expired or already used verfication code.');

        await user.set({
            numberVerified: true,
            numberVerificationCode: undefined
        }).save();

        return this.authenticateUser(user);
    }

    private allPossibleResetOptions(user: User): PasswordResetOption {
        const availablePasswordResetOptions: PasswordResetOption = {};
        if (user.emailVerified)
            availablePasswordResetOptions.email = user.email;
        if (user.numberVerified)
            availablePasswordResetOptions.phone = parsePhoneNumberFromString(user.phone.countryCode + user.phone.number).toString();

        return availablePasswordResetOptions;
    }

    async checkForPasswordResetOptions(forgotPasswordDto: EmailOrNumberDto) {
        const filter = this.emailOrNumberFilterForFindingUser(forgotPasswordDto.emailOrNumber);

        const user = await this.User.findOne(filter);
        if (!user)
            throw new NotFoundException(`User does not exists anymore, this is all we know :(`);

        return this.allPossibleResetOptions(user);
    }

    async sendPasswordResetCodeThroughEmail(emailDto: EmailDto): Promise<MessageResponse> {
        const user = await this.User.findOne({ email: emailDto.email, emailVerified: true });
        if (!user)
            throw new NotFoundException(`User does not exists anymore. This is all we know :(`);

        const verificationCode = this.generateVerificationCode().toString();
        await user.set({
            passwordResetCode: await bcrypt.hash(verificationCode, 12)
        }).save();

        this.mailerService.sendMail({
            from: 'forgetpassword@pockerteam.com',
            to: user.email,
            text: `Verification Code for password reset is ${verificationCode}`
        });

        return { message: `Password reset code sent to your email inbox.` };
    }

    async sendPasswordResetCodeThroughNumber(numberDto: NumberDto): Promise<MessageResponse> {
        const number = parsePhoneNumberFromString(numberDto.number);

        const user = await this.User.findOne({ 
            phone: this.generateUserPhoneFilter(number),
            numberVerified: true
         });

        if (!user)
            throw new NotFoundException(`User does not exists anymore. This is all we know :(`);

        const verificationCode = this.generateVerificationCode().toString();
        await user.set({
            passwordResetCode: await bcrypt.hash(verificationCode, 12)
        }).save();

        this.smsCallService.sendMessage({
            to: number.formatInternational(),
            body: `Verification Code for password reset is ${verificationCode}`
        });

        return { message: `Password reset code sent to your email inbox.` };
    }

}
