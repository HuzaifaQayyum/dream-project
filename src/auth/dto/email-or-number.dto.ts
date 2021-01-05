export class EmailOrNumberDto { 
    // match regex, if its number make sure its a valid number else it should be valid email
    emailOrNumber: string;
}