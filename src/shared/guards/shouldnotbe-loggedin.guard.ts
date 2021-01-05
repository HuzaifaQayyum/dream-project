import { ExecutionContext } from '@nestjs/common';
import { CanActivate } from '@nestjs/common';
import { CustomRequest } from '../interfaces/custom-request.interface';


export class ShouldNotBeLoggedInGuard implements CanActivate  { 
    canActivate(context: ExecutionContext): boolean { 
        const [ req ]: [CustomRequest] = context.getArgs();
        return !Boolean(req.user);
    }
}

