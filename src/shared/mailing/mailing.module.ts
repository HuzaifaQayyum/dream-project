import { Module } from '@nestjs/common';
import { MailerModule } from '@nestjs-modules/mailer';

@Module({
  imports: [
    MailerModule.forRoot({
      transport: {
        host: 'smtp.mailtrap.io',
        port: 2525,
        auth: {
          user: '2f2f5f05a32401',
          pass: '03bdbcc8eb7627',
        },
      },
    }),
  ],
  exports: [MailerModule],
})
export class MailingModule {
}
