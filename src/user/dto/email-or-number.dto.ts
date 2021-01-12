import { IsNotBlank } from '../../validators-serializers/validators/isnot-blank.validator';
import { Transform } from 'class-transformer';
import trim from '../../validators-serializers/serializers/trim.serializer';
import { MaxLength } from 'class-validator';
import { IsEmailOrNumber } from '../../validators-serializers/validators/is-email-or-number.validator';

export class EmailOrNumberDto {
  @IsNotBlank()
  @Transform(trim)
  @MaxLength(100)
  @IsEmailOrNumber()
  emailOrNumber: string;
}