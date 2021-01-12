import { Transform } from 'class-transformer';
import { IsEmail, Length, MaxLength } from 'class-validator';
import { IsNotBlank } from '../../validators-serializers/validators/isnot-blank.validator';
import { IsEmailUnique } from '../../validators-serializers/validators/is-email-unique.validator';
import trim from '../../validators-serializers/serializers/trim.serializer';

export class CreateUserDto {
  @IsNotBlank()
  @Transform(trim)
  @Length(3, 100)
  username: string;

  @IsNotBlank()
  @Transform(trim)
  @MaxLength(100)
  @IsEmail()
  @IsEmailUnique()
  email: string;

  @IsNotBlank()
  @Transform(trim)
  @Length(5, 100)
  password: string;
}