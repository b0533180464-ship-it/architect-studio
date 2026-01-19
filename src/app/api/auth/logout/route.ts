/**
 * POST /api/auth/logout
 * Logout from current session
 */

import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import {
  COOKIE_NAMES,
  verifyToken,
  invalidateSession,
  clearAuthCookies,
} from '@/lib/auth';

export async function POST() {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get(COOKIE_NAMES.accessToken)?.value;

  if (accessToken) {
    const payload = await verifyToken(accessToken);
    if (payload) {
      await invalidateSession(payload.sessionId);
    }
  }

  await clearAuthCookies();

  return NextResponse.json({ success: true });
}
