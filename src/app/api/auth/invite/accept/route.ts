/**
 * GET /api/auth/invite/accept
 * Accept team invitation and create/link user
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// eslint-disable-next-line max-lines-per-function
export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get('token');

  if (!token) {
    return NextResponse.redirect(new URL('/login?error=missing_token', request.url));
  }

  // Find invitation
  const invitation = await prisma.teamInvitation.findUnique({
    where: { token },
    include: { tenant: true },
  });

  if (!invitation) {
    return NextResponse.redirect(new URL('/login?error=invalid_invitation', request.url));
  }

  if (invitation.status !== 'pending') {
    return NextResponse.redirect(new URL('/login?error=invitation_already_used', request.url));
  }

  if (invitation.expiresAt < new Date()) {
    await prisma.teamInvitation.update({
      where: { id: invitation.id },
      data: { status: 'expired' },
    });
    return NextResponse.redirect(new URL('/login?error=invitation_expired', request.url));
  }

  // Check if user already exists in the system
  const existingUser = await prisma.user.findFirst({
    where: { email: invitation.email },
  });

  if (existingUser) {
    // User exists - check if already in this tenant
    if (existingUser.tenantId === invitation.tenantId) {
      return NextResponse.redirect(new URL('/login?error=already_member', request.url));
    }

    // For now, redirect to a page that will handle the choice
    // (In multi-tenant scenario, user might need to choose)
    return NextResponse.redirect(
      new URL(`/invite/complete?token=${token}&existing=true`, request.url)
    );
  }

  // New user - redirect to complete profile
  return NextResponse.redirect(
    new URL(`/invite/complete?token=${token}`, request.url)
  );
}
