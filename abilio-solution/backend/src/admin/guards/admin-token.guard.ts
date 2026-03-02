import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { AdminAuthService } from '../admin-auth.service';

export const ADMIN_TOKEN_HEADER = 'x-admin-token';

@Injectable()
export class AdminTokenGuard implements CanActivate {
  constructor(
    private readonly adminAuthService: AdminAuthService,
    private readonly reflector: Reflector,
  ) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    const token = request.headers[ADMIN_TOKEN_HEADER];
    const raw = typeof token === 'string' ? token : undefined;
    if (!raw || !this.adminAuthService.validateToken(raw)) {
      throw new UnauthorizedException('Invalid or missing x-admin-token');
    }
    return true;
  }
}
