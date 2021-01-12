import { IsNotBlank } from '../../validators-serializers/validators/isnot-blank.validator';
import { IsPhoneNumber, MaxLength } from 'class-validator';
import { Transform } from 'class-transformer';
import trim from '../../validators-serializers/serializers/trim.serializer';

export class NumberDto {
  @IsNotBlank()
  @Transform(trim)
  @MaxLength(100)
  @IsPhoneNumber(null)
  number: string;
}