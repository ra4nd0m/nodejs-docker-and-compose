import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { compare, hash } from 'bcrypt';

import { SALT_ROUNDS } from './constants';

@Injectable()
export class HashService {
  async compare(data: string, hash: string) {
    try {
      return await compare(data, hash);
    } catch {
      throw new InternalServerErrorException('Password comparison error');
    }
  }

  async hash(data: string) {
    try {
      return hash(data, SALT_ROUNDS);
    } catch {
      throw new InternalServerErrorException('Password hashing error');
    }
  }
}
