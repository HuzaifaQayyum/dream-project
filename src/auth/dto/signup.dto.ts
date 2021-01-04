export class SignupDto { 
    // validate email uniqueness here
    username: string;
    email: string;
    password: string;
    verified?: boolean;
}