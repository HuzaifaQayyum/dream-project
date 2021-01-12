import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class EncryptionService {
  hash(value: string): Promise<string> {
    return bcrypt.hash(value, 12);
  }

  compare(string: string, hash: string): Promise<boolean> {
    return bcrypt.compare(string, hash);
  }
}
