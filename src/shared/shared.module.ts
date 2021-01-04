import { Module, Global } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from './models/User.model';
import { SmsCallService } from './services/sms_call.service';

@Global()
@Module({
    imports: [
        JwtModule.register({
            secret: process.env.JwtSecret || 'hello world'
        }),
        MongooseModule.forFeature([
            { name: User.name, schema: UserSchema }
        ])
    ],
    providers: [
        SmsCallService
    ],
    exports: [
        SmsCallService,
        JwtModule,
        MongooseModule
    ]
})
export class SharedModule { }