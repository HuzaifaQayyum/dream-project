import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { ValidatorsSerializersModule } from './validators-serializers/validators-serializers.module';
import { GuardsModule } from './guards/guards.module';
import { SharedModule } from './shared/shared.module';

@Module({
  imports: [
    SharedModule,
    AuthModule,
    ValidatorsSerializersModule,
    GuardsModule,
  ],
})
export class AppModule {
}