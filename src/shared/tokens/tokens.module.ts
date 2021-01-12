import { Global, Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';

@Global()
@Module({
  imports: [
    JwtModule.register({
      secret: process.env.JwtSecret || 'hello world',
    }),
  ],
  exports: [JwtModule],
})
export class TokensModule {
}
