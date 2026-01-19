/**
 * POST /api/auth/logout-all
 * Logout from all devices
 */

import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import {
  COOKIE_NAMES,
  verifyToken,
  invalidateAllSessions,
  clearAuthCookies,
} from '@/lib/auth';

export async function POST() {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get(COOKIE_NAMES.accessToken)?.value;

  if (accessToken) {
    const payload = await verifyToken(accessToken);
    if (payload) {
      await invalidateAllSessions(payload.userId);
    }
  }

  await clearAuthCookies();

  return NextResponse.json({ success: true });
}
