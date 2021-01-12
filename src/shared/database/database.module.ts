import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
  imports: [
    MongooseModule.forRoot('mongodb://localhost:27017/social_site', {
      useUnifiedTopology: true,
      useNewUrlParser: true,
    }),
  ],
  exports: [MongooseModule],
})
export class DatabaseModule {
}
