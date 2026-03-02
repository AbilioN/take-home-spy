import { Injectable } from '@nestjs/common';
import { randomBytes } from 'crypto';

@Injectable()
export class AdminAuthService {
  private currentToken: string | null = null;

  generateToken(): string {
    this.currentToken = randomBytes(32).toString('hex');
    return this.currentToken;
  }

  validateToken(token: string): boolean {
    return this.currentToken !== null && this.currentToken === token;
  }
}
