import { createParamDecorator, type ExecutionContext } from '@nestjs/common';
import type { Request } from 'express';

import type { AuthUser } from './auth.config';

interface AuthenticatedRequest extends Request {
  user?: AuthUser;
}

/**
 * Inject the authenticated user into a route handler.
 * Returns undefined on public endpoints — handlers that depend on a
 * user should not be marked @Public.
 */
export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): AuthUser | undefined => {
    const request = ctx.switchToHttp().getRequest<AuthenticatedRequest>();
    return request.user;
  },
);
