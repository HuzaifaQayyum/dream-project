import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Model } from 'mongoose';
import { User } from '../user/models/User.model';
import { InjectModel } from '@nestjs/mongoose';
import { BearerTokenPayloadInterface } from '../auth/interfaces/bearer-token-payload.interface';

@Injectable()
export class JwtGuard implements CanActivate {

  constructor(
    private readonly jwtService: JwtService,
    @InjectModel(User.name) private readonly User: Model<User>) {
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const [request] = context.getArgs();

    try {
      const token = request.headers['authorization'].split(' ')[1];
      const decodedToken = await this.jwtService.verifyAsync<BearerTokenPayloadInterface>(token);

      const user = await this.User.findById(decodedToken._id);
      if (!user)
        return false;

      request.user = user;
      return true;

    } catch {
      return false;
    }
  }
}