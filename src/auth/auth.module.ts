import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { User, UserSchema } from '../shared/models/User.model';

@Module({
  imports: [
  ],
  controllers: [AuthController],
  providers: [
    AuthService
  ]
})
export class AuthModule { }
