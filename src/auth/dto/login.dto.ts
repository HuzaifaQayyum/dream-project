import { EmailOrNumberDto } from './email-or-number.dto';

export class LoginDto extends EmailOrNumberDto { 
    password: string;
}