/**
 * What GET /bff/user (and a successful POST /bff/login) returns: the only identity information the browser holds.
 * It is NOT in the generated API client (src/app/api) because it is the BFF's own contract, not the API's, so it is
 * hand-written here. It replaces the claims the app used to decode out of the JWT.
 */
export interface BffUser {
  userName: string;
  isAdmin: boolean;
  userId: number;
  userPublicId: string;
}
