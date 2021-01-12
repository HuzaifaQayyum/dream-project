import { MessageResponse } from './message-response.interface';

export interface AuthenticationResponse extends MessageResponse {
  token: string;
  emailVerified: boolean;
  numberVerified: boolean;
}