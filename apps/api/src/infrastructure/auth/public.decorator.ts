import { SetMetadata } from '@nestjs/common';

export const IS_PUBLIC_KEY = 'auth:isPublic';

/**
 * Mark a controller or route handler as public — the AuthGuard
 * will skip session validation for those endpoints.
 */
export const Public = (): MethodDecorator & ClassDecorator => SetMetadata(IS_PUBLIC_KEY, true);
