import {
  CanActivate,
  type ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { Request } from 'express';

import type { AuthUser } from './auth.config';
import { AuthService } from './auth.service';
import { IS_PUBLIC_KEY } from './public.decorator';

interface AuthenticatedRequest extends Request {
  user?: AuthUser;
}

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly authService: AuthService,
  ) {}

  public async canActivate(ctx: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      ctx.getHandler(),
      ctx.getClass(),
    ]);
    if (isPublic) {
      return true;
    }

    const request = ctx.switchToHttp().getRequest<AuthenticatedRequest>();
    const headers = toHeaders(request);
    const session = await this.authService.getSession(headers);

    if (!session) {
      throw new UnauthorizedException('Authentication required');
    }

    request.user = session.user;
    return true;
  }
}

/**
 * Convert an Express request's headers (Node IncomingHttpHeaders) into
 * a standard Fetch `Headers` instance — Better Auth expects the latter.
 */
function toHeaders(request: Request): Headers {
  const headers = new Headers();
  for (const [name, value] of Object.entries(request.headers)) {
    if (value === undefined) continue;
    if (Array.isArray(value)) {
      for (const v of value) headers.append(name, v);
    } else {
      headers.set(name, value);
    }
  }
  return headers;
}
