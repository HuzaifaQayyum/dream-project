import { IsNotEmpty, IsPhoneNumber } from "class-validator";

export class VerifyNumberDto {
    @IsNotEmpty()
    verificationCode: string;
}