/**
 * POST /api/auth/magic-link
 * Request a magic link for login/signup
 */

import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';
import { prisma } from '@/lib/prisma';
import { createMagicLinkToken, getMagicLinkUrl } from '@/lib/auth';

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

async function sendMagicLink(email: string) {
  const existingUser = await prisma.user.findFirst({
    where: { email: email.toLowerCase() },
  });

  const type = existingUser ? 'login' : 'signup';
  const token = await createMagicLinkToken(email.toLowerCase(), type);
  const magicLinkUrl = getMagicLinkUrl(token);

  // Send email via Resend if configured
  if (resend) {
    await resend.emails.send({
      from: process.env.EMAIL_FROM || 'Architect Studio <onboarding@resend.dev>',
      to: email,
      subject: type === 'login' ? 'התחברות ל-Architect Studio' : 'ברוכים הבאים ל-Architect Studio',
      html: `
        <div dir="rtl" style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">${type === 'login' ? 'התחברות לחשבון' : 'ברוכים הבאים!'}</h2>
          <p>לחץ על הכפתור למטה כדי ${type === 'login' ? 'להתחבר לחשבון' : 'להשלים את ההרשמה'}:</p>
          <a href="${magicLinkUrl}"
             style="display: inline-block; background-color: #2563eb; color: white; padding: 12px 24px;
                    text-decoration: none; border-radius: 6px; margin: 16px 0;">
            ${type === 'login' ? 'התחבר עכשיו' : 'השלם הרשמה'}
          </a>
          <p style="color: #666; font-size: 14px;">הקישור תקף ל-15 דקות.</p>
          <p style="color: #999; font-size: 12px;">אם לא ביקשת קישור זה, התעלם מהמייל הזה.</p>
        </div>
      `,
    });
  } else {
    // In development without Resend, log the link
    // eslint-disable-next-line no-console
    console.log(`\n[Magic Link] ${email} (${type}): ${magicLinkUrl}\n`);
  }

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
