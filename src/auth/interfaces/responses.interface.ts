import { NextSteps } from "../auth.service";

export interface MessageResponse {
    nextStep?: NextSteps;
    message?: string;
}

export interface AuthenticatedResponse extends MessageResponse {
    token: string;
    emailVerified: boolean;
    numberVerified: boolean;
}