import { IsNotBlank } from '../../validators-serializers/validators/isnot-blank.validator';
import { Transform } from 'class-transformer';
import trim from '../../validators-serializers/serializers/trim.serializer';
import { Length, MaxLength } from 'class-validator';
import { IsEmailOrNumber } from '../../validators-serializers/validators/is-email-or-number.validator';

export class LoginDto {
  @IsNotBlank()
  @Transform(trim)
  @MaxLength(100)
  @IsEmailOrNumber()
  emailOrNumber: string;

  @IsNotBlank()
  @Transform(trim)
  @Length(5, 100)
  password: string;
}