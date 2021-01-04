import { JwtBearerTokenMiddleware } from './shared/middleware/jwt-bearertoken.middleware';
import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { MailerModule } from '@nestjs-modules/mailer';
import { MongooseModule } from '@nestjs/mongoose';
import { SharedModule } from './shared/shared.module';


@Module({
  imports: [
    SharedModule,
    AuthModule,
    MailerModule.forRoot({
      transport: {
        host: "smtp.mailtrap.io",
        port: 2525,
        auth: {
          user: "2f2f5f05a32401",
          pass: "03bdbcc8eb7627"
        }
      }
    }),
    MongooseModule.forRoot('mongodb://localhost:27017/social_site', {
      useUnifiedTopology: true,
      useNewUrlParser: true
    })
  ],
  controllers: [AppController],
  providers: [
    AppService
  ],
})
export class AppModule implements NestModule { 
    configure(consumer: MiddlewareConsumer) { 
      consumer.apply(JwtBearerTokenMiddleware).forRoutes('*');
    }
}
