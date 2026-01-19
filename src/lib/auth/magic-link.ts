/**
 * Magic Link utilities
 */

import { randomBytes } from 'crypto';
import { prisma } from '../prisma';
import { AUTH_CONFIG } from './config';

export async function createMagicLinkToken(
  email: string,
  type: 'login' | 'signup' = 'login'
): Promise<string> {
  const token = randomBytes(32).toString('hex');
  const expires = new Date(Date.now() + AUTH_CONFIG.magicLink.expiresIn * 1000);

  await prisma.verificationToken.create({
    data: {
      identifier: email,
      token,
      expires,
      type,
    },
  });

  return token;
}

export async function verifyMagicLinkToken(token: string): Promise<{
  email: string;
  type: string;
} | null> {
  const record = await prisma.verificationToken.findUnique({
    where: { token },
  });

  if (!record) return null;
  if (record.expires < new Date()) return null;
  if (record.usedAt) return null;

  // Mark as used
  await prisma.verificationToken.update({
    where: { token },
    data: { usedAt: new Date() },
  });

  return { email: record.identifier, type: record.type };
}

export function getMagicLinkUrl(token: string): string {
  const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
  return `${baseUrl}/api/auth/verify?token=${token}`;
}
