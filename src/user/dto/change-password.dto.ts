import { IsNotBlank } from '../../validators-serializers/validators/isnot-blank.validator';
import { Transform } from 'class-transformer';
import trim from '../../validators-serializers/serializers/trim.serializer';
import { MaxLength } from 'class-validator';
import { SameValue } from '../../validators-serializers/validators/same-value.validator';

export class ChangePasswordDto {
  @IsNotBlank()
  @Transform(trim)
  @MaxLength(100)
  newPassword: string;

  @IsNotBlank()
  @Transform(trim)
  @MaxLength(100)
  @SameValue('newPassword')
  confirmPassword: string;
}