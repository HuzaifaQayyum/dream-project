import { Global, Module } from '@nestjs/common';
import { IsEmailUniqueConstraint } from './validators/is-email-unique.validator';
import { UserModule } from '../user/user.module';

@Global()
@Module({
  imports: [UserModule],
  providers: [
    IsEmailUniqueConstraint,
  ],
})
export class ValidatorsSerializersModule {
}
