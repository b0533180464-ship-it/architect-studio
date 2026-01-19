/**
 * POST /api/auth/refresh
 * Refresh access token using refresh token
 */

import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';
import { COOKIE_NAMES, verifyToken, createAccessToken, setAuthCookies } from '@/lib/auth';

async function refreshAccessToken(refreshToken: string) {
  const payload = await verifyToken(refreshToken);
  if (!payload) return null;

  const session = await prisma.session.findUnique({
    where: { id: payload.sessionId },
  });

  if (!session?.isActive) return null;

  const newAccessToken = await createAccessToken({
    userId: payload.userId,
    tenantId: payload.tenantId,
    sessionId: payload.sessionId,
  });

  await prisma.session.update({
    where: { id: payload.sessionId },
    data: { lastActiveAt: new Date() },
  });

  return { newAccessToken, refreshToken };
}

export async function POST() {
  const cookieStore = await cookies();
  const refreshToken = cookieStore.get(COOKIE_NAMES.refreshToken)?.value;

  if (!refreshToken) {
    return NextResponse.json({ error: 'No refresh token' }, { status: 401 });
  }

  const result = await refreshAccessToken(refreshToken);
  if (!result) {
    return NextResponse.json({ error: 'Invalid or expired token' }, { status: 401 });
  }

  await setAuthCookies(result.newAccessToken, result.refreshToken);
  return NextResponse.json({ success: true });
}
