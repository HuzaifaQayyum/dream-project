export interface UserPhoneObject {
  countryCode: string;
  number: string;
}

export interface UserPhoneNumber {
  phone: UserPhoneObject,
  numberVerified?: boolean;
}