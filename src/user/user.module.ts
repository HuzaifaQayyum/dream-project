import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from './models/User.model';
import { EncryptionModule } from '../encryption/encryption.module';
import { SignupLoginService } from './services/signup-login.service';
import { UserNumberService } from './services/user-number.service';
import { CommonUserService } from './services/common.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
    ]),
    EncryptionModule
  ],
  providers: [
    SignupLoginService,
    UserNumberService,
    CommonUserService,
  ],
  exports: [
    SignupLoginService,
    UserNumberService,
    CommonUserService,
    MongooseModule,
  ],
})
export class UserModule {
}
