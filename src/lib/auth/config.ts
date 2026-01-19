/**
 * Auth Configuration - Based on spec section ו (Security Configuration)
 */

export const AUTH_CONFIG = {
  accessToken: {
    expiresIn: 24 * 60 * 60, // 24 hours (seconds)
  },
  refreshToken: {
    expiresIn: 30 * 24 * 60 * 60, // 30 days (seconds)
  },
  magicLink: {
    expiresIn: 15 * 60, // 15 minutes (seconds)
  },
  session: {
    maxConcurrent: 5,
  },
} as const;

export const COOKIE_NAMES = {
  accessToken: 'auth_access_token',
  refreshToken: 'auth_refresh_token',
} as const;
