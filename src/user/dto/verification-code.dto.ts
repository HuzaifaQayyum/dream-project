import { IsExactLength } from '../../validators-serializers/validators/is-exact-length';
import { Transform } from 'class-transformer';
import { IsNotBlank } from '../../validators-serializers/validators/isnot-blank.validator';
import trim from '../../validators-serializers/serializers/trim.serializer';

export class VerificationCodeDto {
  @IsNotBlank()
  @Transform(trim)
  @IsExactLength(6)
  verificationCode: string;
}