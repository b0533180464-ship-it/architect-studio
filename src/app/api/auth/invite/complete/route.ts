/**
 * POST /api/auth/invite/complete
 * Complete team invitation - create user and session
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createSession, setAuthCookies } from '@/lib/auth';
import { z } from 'zod';

const completeInviteSchema = z.object({
  token: z.string(),
  firstName: z.string().min(1).max(100),
  lastName: z.string().min(1).max(100),
});

// eslint-disable-next-line max-lines-per-function
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const input = completeInviteSchema.parse(body);

    // Find invitation
    const invitation = await prisma.teamInvitation.findUnique({
      where: { token: input.token },
      include: { tenant: true },
    });

    if (!invitation) {
      return NextResponse.json({ error: 'Invalid invitation' }, { status: 400 });
    }

    if (invitation.status !== 'pending') {
      return NextResponse.json({ error: 'Invitation already used' }, { status: 400 });
    }

    if (invitation.expiresAt < new Date()) {
      return NextResponse.json({ error: 'Invitation expired' }, { status: 400 });
    }

    // Check if user already exists
    let user = await prisma.user.findFirst({
      where: { email: invitation.email },
    });

    if (user) {
      // User exists in another tenant - for now, return error
      // Multi-tenant user support can be added later
      if (user.tenantId !== invitation.tenantId) {
        return NextResponse.json(
          { error: 'User already exists in another organization' },
          { status: 400 }
        );
      }
    } else {
      // Create new user
      user = await prisma.user.create({
        data: {
          tenantId: invitation.tenantId,
          email: invitation.email,
          firstName: input.firstName,
          lastName: input.lastName,
          role: invitation.role,
          permissions: (invitation.customPermissions as object) || {},
        },
      });
    }

    // Update invitation status
    await prisma.teamInvitation.update({
      where: { id: invitation.id },
      data: {
        status: 'accepted',
        acceptedAt: new Date(),
        existingUserId: user.id,
      },
    });

    // Create session
    const session = await createSession(user.id, user.tenantId);
    await setAuthCookies(session.accessToken, session.refreshToken);

    return NextResponse.json({
      success: true,
      redirectTo: '/dashboard',
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid input', details: error.errors }, { status: 400 });
    }
    console.error('Invite complete error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
