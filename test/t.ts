import parsePhoneNumberFromString, { parseNumber, parsePhoneNumber, parsePhoneNumberWithError } from 'libphonenumber-js';

const n = parsePhoneNumberFromString('+9230083536735');
console.log(n && n.isValid())