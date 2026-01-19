/**
 * POST /api/auth/magic-link
 * Request a magic link for login/signup
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createMagicLinkToken, getMagicLinkUrl } from '@/lib/auth';

async function sendMagicLink(email: string) {
  const existingUser = await prisma.user.findFirst({
    where: { email: email.toLowerCase() },
  });

  const type = existingUser ? 'login' : 'signup';
  const token = await createMagicLinkToken(email.toLowerCase(), type);
  const magicLinkUrl = getMagicLinkUrl(token);

  // In development, log the link (no email service)
  if (!process.env.RESEND_API_KEY) {
    // eslint-disable-next-line no-console
    console.log(`\n[Magic Link] ${email} (${type}): ${magicLinkUrl}\n`);
  }

  // TODO: Send email via Resend when API key is configured
  return { magicLinkUrl, type };
}

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email || typeof email !== 'string') {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    const { magicLinkUrl } = await sendMagicLink(email);

    return NextResponse.json({
      success: true,
      message: 'Magic link sent to your email',
      ...(process.env.NODE_ENV === 'development' && { magicLinkUrl }),
    });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Magic link error:', error);
    return NextResponse.json({ error: 'Failed to send magic link' }, { status: 500 });
  }
}
