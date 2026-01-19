/**
 * Get current auth context from cookies
 */

import { cookies } from 'next/headers';
import { prisma } from '../prisma';
import { COOKIE_NAMES } from './config';
import { verifyToken } from './tokens';

export interface AuthContext {
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: string;
  };
  tenantId: string | null;
  sessionId: string;
}

export async function getAuth(): Promise<AuthContext | null> {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get(COOKIE_NAMES.accessToken)?.value;

  if (!accessToken) return null;

  const payload = await verifyToken(accessToken);
  if (!payload) return null;

  const user = await prisma.user.findUnique({
    where: { id: payload.userId },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      role: true,
      tenantId: true,
    },
  });

  if (!user) return null;

  return {
    user: {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
    },
    tenantId: user.tenantId,
    sessionId: payload.sessionId,
  };
}
