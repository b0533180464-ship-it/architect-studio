/**
 * GET /api/auth/invite/info
 * Get invitation details for display
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get('token');

  if (!token) {
    return NextResponse.json({ error: 'missing_token' }, { status: 400 });
  }

  const invitation = await prisma.teamInvitation.findUnique({
    where: { token },
    include: {
      tenant: { select: { name: true } },
      invitedBy: { select: { firstName: true, lastName: true } },
    },
  });

  if (!invitation) {
    return NextResponse.json({ error: 'invalid_invitation' }, { status: 400 });
  }

  if (invitation.status !== 'pending') {
    return NextResponse.json({ error: 'invitation_already_used' }, { status: 400 });
  }

  if (invitation.expiresAt < new Date()) {
    return NextResponse.json({ error: 'invitation_expired' }, { status: 400 });
  }

  return NextResponse.json({
    email: invitation.email,
    role: invitation.role,
    tenantName: invitation.tenant.name,
    invitedBy: `${invitation.invitedBy.firstName} ${invitation.invitedBy.lastName}`.trim() || 'Unknown',
  });
}
