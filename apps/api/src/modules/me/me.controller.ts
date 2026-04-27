import core from '@nestia/core';
import { Controller } from '@nestjs/common';

import type { AuthUser } from '../../infrastructure/auth/auth.config';
import { CurrentUser } from '../../infrastructure/auth/current-user.decorator';
import type { MeProfile } from './me.types';

@Controller('me')
export class MeController {
  /**
   * Return the currently authenticated user's profile.
   */
  @core.TypedRoute.Get()
  public me(@CurrentUser() user: AuthUser): MeProfile {
    return toProfile(user);
  }
}

function toProfile(user: AuthUser): MeProfile {
  return {
    id: user.id,
    email: user.email,
    name: user.name ?? null,
    image: user.image ?? null,
    emailVerified: user.emailVerified,
    role: (user as { role?: string }).role ?? 'user',
    coins: (user as { coins?: number }).coins ?? 0,
    createdAt:
      user.createdAt instanceof Date
        ? user.createdAt.toISOString()
        : new Date(user.createdAt as unknown as string).toISOString(),
  };
}
