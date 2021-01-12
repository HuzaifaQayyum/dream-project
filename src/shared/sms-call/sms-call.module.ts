import { Module } from '@nestjs/common';
import { SmsCallService } from './sms-call.service';

@Module({
  providers: [SmsCallService],
  exports: [SmsCallService],
})
export class SmsCallModule {
}
