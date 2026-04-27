import { Injectable } from '@nestjs/common';

import { auth, type AuthSession } from './auth.config';

@Injectable()
export class AuthService {
  /**
   * Validate the incoming request's session against Better Auth.
   * Returns null when no valid session is attached.
   */
  public async getSession(headers: Headers): Promise<AuthSession | null> {
    const session = (await auth.api.getSession({ headers })) as AuthSession | null;
    return session ?? null;
  }
}
