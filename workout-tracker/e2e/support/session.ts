import { ApiClient } from './api-client';

export interface SessionCredentials {
  userName: string;
  password: string;
}

/**
 * Mints a brand new BFF session for the given account and returns it as a Playwright storage state.
 *
 * The whole session is one cookie: the BFF's HttpOnly `wt.session`, which only names a server-side session. We get it
 * by signing in through the BFF exactly as the browser would, then lift the cookie out of the request context's jar.
 * There are no tokens and no localStorage to seed. The app restores the session by asking GET /bff/user, which the
 * browser answers with this cookie.
 *
 * Why the cookie works in a browser that talks to a different port: cookies are scoped by host, not port, so the
 * cookie the BFF set for localhost:5602 is also sent to the dev server on localhost:4201, which proxies it onward.
 *
 * This is deliberately done per test rather than once in the global setup. Logging off ends the session on the server
 * (the BFF revokes it), so a state shared by several tests would die the moment one of them tests logout.
 */
export async function createSessionState(credentials: SessionCredentials) {
  const client = await ApiClient.authenticateAs(credentials.userName, credentials.password);

  try {
    return await client.sessionState();
  } finally {
    await client.dispose();
  }
}
