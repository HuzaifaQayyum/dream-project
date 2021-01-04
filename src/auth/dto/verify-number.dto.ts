import { IsNotEmpty, IsPhoneNumber } from "class-validator";

export class VerifyNumberDto {
    @IsNotEmpty()
    @IsPhoneNumber(null)
    number: string;
    @IsNotEmpty()
    verificationCode: string;
}