import { IsNotEmpty, IsPhoneNumber } from "class-validator";


export class NumberDto { 
    @IsNotEmpty()
    @IsPhoneNumber(null)
    number: string;
}