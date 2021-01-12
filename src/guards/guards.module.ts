import { Global, Module } from '@nestjs/common';
import { JwtGuard } from './jwt.guard';
import { UserModule } from '../user/user.module';

@Global()
@Module({
  imports: [UserModule],
  providers: [JwtGuard],
  exports: [JwtGuard],
})
export class GuardsModule {
}