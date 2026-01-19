/**
 * GET /api/auth/verify
 * Verify magic link token and create session
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyMagicLinkToken, createSession, setAuthCookies } from '@/lib/auth';

async function createNewUserWithTenant(email: string) {
  return prisma.$transaction(async (tx) => {
    const tenant = await tx.tenant.create({
      data: { name: 'My Studio', slug: `studio-${Date.now()}`, email },
    });
    return tx.user.create({
      data: { tenantId: tenant.id, email, firstName: '', lastName: '', role: 'owner' },
      include: { tenant: true },
    });
  });
}

async function getRedirectUrl(userId: string): Promise<string> {
  const onboarding = await prisma.onboardingState.findUnique({ where: { userId } });
  return onboarding?.completedAt ? '/dashboard' : '/onboarding';
}

export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get('token');
  if (!token) {
    return NextResponse.redirect(new URL('/login?error=missing_token', request.url));
  }

  const tokenData = await verifyMagicLinkToken(token);
  if (!tokenData) {
    return NextResponse.redirect(new URL('/login?error=invalid_token', request.url));
  }

  try {
    let user = await prisma.user.findFirst({
      where: { email: tokenData.email },
      include: { tenant: true },
    });

    if (!user && tokenData.type === 'signup') {
      user = await createNewUserWithTenant(tokenData.email);
    }

    if (!user) {
      return NextResponse.redirect(new URL('/login?error=user_not_found', request.url));
    }

    const session = await createSession(user.id, user.tenantId);
    await setAuthCookies(session.accessToken, session.refreshToken);
    await prisma.user.update({ where: { id: user.id }, data: { lastLoginAt: new Date() } });

    const redirectUrl = await getRedirectUrl(user.id);
    return NextResponse.redirect(new URL(redirectUrl, request.url));
  } catch {
    return NextResponse.redirect(new URL('/login?error=server_error', request.url));
  }
}
