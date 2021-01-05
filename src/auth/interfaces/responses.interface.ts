export interface MessageResponse {
    message?: string;
}

export interface AuthenticatedResponse extends MessageResponse {
    token: string;
    emailVerified: boolean;
    numberVerified: boolean;
}