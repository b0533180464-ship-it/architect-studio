/**
 * Auth module exports
 */

export { AUTH_CONFIG, COOKIE_NAMES } from './config';
export { createAccessToken, createRefreshToken, verifyToken } from './tokens';
export type { TokenPayload } from './tokens';
export {
  createMagicLinkToken,
  verifyMagicLinkToken,
  getMagicLinkUrl,
} from './magic-link';
export {
  createSession,
  invalidateSession,
  invalidateAllSessions,
  setAuthCookies,
  clearAuthCookies,
} from './session';
export type { SessionData } from './session';
export { getAuth } from './get-auth';
export type { AuthContext } from './get-auth';
