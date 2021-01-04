import { Prop, raw, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from 'mongoose';

@Schema()
export class User extends Document { 
    @Prop()
    username: string;

    @Prop()
    email: string;

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
        number: String
    }))
    phone: {
        countryCode: string;
        number: string;
    };

    @Prop()
    numberVerified: boolean
}

export const UserSchema = SchemaFactory.createForClass(User)