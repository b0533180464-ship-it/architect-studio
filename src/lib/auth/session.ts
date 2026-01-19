/**
 * Session management utilities
 */

import { cookies } from 'next/headers';
import { prisma } from '../prisma';
import { AUTH_CONFIG, COOKIE_NAMES } from './config';
import { createAccessToken, createRefreshToken, TokenPayload } from './tokens';

export interface SessionData {
  userId: string;
  tenantId: string | null;
  sessionId: string;
  accessToken: string;
  refreshToken: string;
}

async function createDbSession(userId: string, deviceInfo?: Record<string, string>) {
  const expires = new Date(Date.now() + AUTH_CONFIG.refreshToken.expiresIn * 1000);
  return prisma.session.create({
    data: {
      userId,
      sessionToken: crypto.randomUUID(),
      expires,
      deviceType: deviceInfo?.deviceType,
      browser: deviceInfo?.browser,
      ip: deviceInfo?.ip,
    },
  });
}

export async function createSession(userId: string, tenantId: string | null): Promise<SessionData> {
  const session = await createDbSession(userId);
  const payload: TokenPayload = { userId, tenantId, sessionId: session.id };
  const [accessToken, refreshToken] = await Promise.all([
    createAccessToken(payload),
    createRefreshToken(payload),
  ]);
  return { userId, tenantId, sessionId: session.id, accessToken, refreshToken };
}

export async function invalidateSession(sessionId: string): Promise<void> {
  await prisma.session.update({
    where: { id: sessionId },
    data: { isActive: false, revokedAt: new Date() },
  });
}

export async function invalidateAllSessions(userId: string): Promise<void> {
  await prisma.session.updateMany({
    where: { userId, isActive: true },
    data: { isActive: false, revokedAt: new Date() },
  });
}

export async function setAuthCookies(accessToken: string, refreshToken: string) {
  const cookieStore = await cookies();
  const options = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    path: '/',
  };

  cookieStore.set(COOKIE_NAMES.accessToken, accessToken, {
    ...options,
    maxAge: AUTH_CONFIG.accessToken.expiresIn,
  });
  cookieStore.set(COOKIE_NAMES.refreshToken, refreshToken, {
    ...options,
    maxAge: AUTH_CONFIG.refreshToken.expiresIn,
  });
}

export async function clearAuthCookies() {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAMES.accessToken);
  cookieStore.delete(COOKIE_NAMES.refreshToken);
}
