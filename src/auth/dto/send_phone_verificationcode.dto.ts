import { IsNotEmpty, IsPhoneNumber } from "class-validator";
import { Transform } from "class-transformer";
import { parsePhoneNumber, PhoneNumber } from "libphonenumber-js";


export class SendNumberVerificationCodeDto { 
    @IsNotEmpty()
    @IsPhoneNumber(null)
    number: string;
}