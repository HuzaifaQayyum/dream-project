import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { CustomRequest } from '../interfaces/custom-request.interface';

@Injectable()
export class EmailShouldBeVerifiedGuard implements CanActivate { 
    canActivate(context: ExecutionContext): boolean { 
        const request: CustomRequest = context.getArgByIndex(0);
        return !!request.user && request.user.emailVerified;
    }
}