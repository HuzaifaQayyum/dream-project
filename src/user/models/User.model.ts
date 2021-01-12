import { Prop, raw, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { UserPhoneObject } from '../interfaces/user-phone.interface';

@Schema()
export class User extends Document {
  @Prop()
  username: string;

  @Prop()
  email: string;

  @Prop()
  passwordResetCode: string;

  @Prop()
  password: string;

  @Prop()
  emailVerificationCode: string;

  @Prop()
  verified: boolean;

  @Prop()
  emailVerified: boolean;

  @Prop()
  numberVerificationCode: string;

  @Prop(raw({
    countryCode: String,
    number: String,
  }))
  phone: UserPhoneObject;

  @Prop()
  numberVerified: boolean;

  @Prop()
  canResetPassword: boolean;
}

export const UserSchema = SchemaFactory.createForClass(User);