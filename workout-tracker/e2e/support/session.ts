import { ApiClient } from './api-client';
import { FRONTEND_URL, REFRESH_TOKEN_STORAGE_KEY, TOKEN_STORAGE_KEY } from './env';
import type { AuthTokenResultDTO } from '../../src/app/api/types.gen';

export interface SessionCredentials {
  userName: string;
  password: string;
}

/**
 * Builds a Playwright storage state that the app will restore as a logged-in session.
 *
 * The values are JSON.stringify'd because LocalStorageService round-trips everything through
 * JSON — a bare token string makes JSON.parse throw during app initialization, and the app
 * hangs forever on its "Loading..." placeholder with no visible error.
 */
export function buildStorageState(tokens: AuthTokenResultDTO) {
  return {
    cookies: [],
    origins: [
      {
        origin: FRONTEND_URL,
        localStorage: [
          { name: TOKEN_STORAGE_KEY, value: JSON.stringify(tokens.accessToken) },
          { name: REFRESH_TOKEN_STORAGE_KEY, value: JSON.stringify(tokens.refreshToken) },
        ],
      },
    ],
  };
}

/**
 * Mints a brand new session for the given account.
 *
 * This is deliberately done per test rather than once in the global setup. Restoring a session
 * always ends up calling /auth/refresh, and refresh *rotates* the refresh token — the old one is
 * marked revoked and replaced. A storage state reused by a second test therefore presents an
 * already-revoked refresh token, the refresh fails, and the app silently drops to logged out.
 */
export async function createSessionState(credentials: SessionCredentials) {
  const client = await ApiClient.anonymous();

  try {
    return buildStorageState(await client.logIn(credentials.userName, credentials.password));
  } finally {
    await client.dispose();
  }
}
