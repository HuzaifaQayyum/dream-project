import { BearerTokenInterface } from './../interfaces/bearer-token-payload.interface';
import { CustomRequest } from './../interfaces/custom-request.interface';
import { NextFunction, request } from 'express';
import { Injectable, NestMiddleware, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from '../models/User.model';


@Injectable()
export class JwtBearerTokenMiddleware implements NestMiddleware {

    constructor(
        private readonly jwtService: JwtService,
        @InjectModel(User.name) private readonly User: Model<User>
    ) { }

    async use(req: CustomRequest, res: Response, next: NextFunction) {
        req.user = null;

        const authorizationHeader = req.headers['authorization'] && req.headers['authorization'].split(' ');
        if (authorizationHeader && authorizationHeader.length === 2) {
            const decoded_token: BearerTokenInterface | null = await this.jwtService.verifyAsync(authorizationHeader[1]).catch(_ => null);
            if (decoded_token) { 
                const user = await this.User.findById(decoded_token._id);
                if (!user) throw new UnauthorizedException();
                req.user = user;
            }
        }
        
        return next();
    }
}