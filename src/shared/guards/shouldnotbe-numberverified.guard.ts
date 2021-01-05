import { CustomRequest } from './../interfaces/custom-request.interface';
import { ExecutionContext } from '@nestjs/common';
import { CanActivate } from '@nestjs/common';


export class ShouldNotBeNumberVerifiedGuard implements CanActivate  { 
    canActivate(context: ExecutionContext): boolean { 
        const [ req ]: [CustomRequest] = context.getArgs();
        return Boolean(req.user) && req.user.numberVerified !== true;
    }
}