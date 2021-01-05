import { NextSteps } from "../auth.service";

export interface ExtraResponseProps {
    nextStep?: NextSteps;
    message?: string;
}

export interface AuthenticatedResponse extends ExtraResponseProps {
    token: string;
    emailVerified: boolean;
    numberVerified: boolean;
}

export interface MessageResponse { 
    message: string,
    nextStep?: NextSteps
}