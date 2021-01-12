import { IsNotBlank } from '../../validators-serializers/validators/isnot-blank.validator';
import { Transform } from 'class-transformer';
import trim from '../../validators-serializers/serializers/trim.serializer';
import { IsEmail, MaxLength } from 'class-validator';

export class EmailDto {
  @IsNotBlank()
  @Transform(trim)
  @MaxLength(100)
  @IsEmail()
  email: string;
}