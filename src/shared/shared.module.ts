import { Global, Module } from '@nestjs/common';
import { DatabaseModule } from './database/database.module';
import { MailingModule } from './mailing/mailing.module';
import { SmsCallModule } from './sms-call/sms-call.module';
import { TokensModule } from './tokens/tokens.module';

@Global()
@Module({
  imports: [
    DatabaseModule,
    MailingModule,
    SmsCallModule,
    TokensModule
  ],
  exports: [
    DatabaseModule,
    MailingModule,
    SmsCallModule,
    TokensModule
  ]
})
export class SharedModule { }