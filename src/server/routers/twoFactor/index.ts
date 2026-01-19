/* eslint-disable max-lines-per-function */
import { TRPCError } from '@trpc/server';
import { authenticator } from 'otplib';
import * as QRCode from 'qrcode';
import crypto from 'crypto';
import { createTRPCRouter, tenantProcedure } from '../../trpc';
import {
  setupTwoFactorSchema,
  verifyTwoFactorSchema,
  disableTwoFactorSchema,
  verifyBackupCodeSchema,
} from './schemas';

const BACKUP_CODES_COUNT = 10;

function generateBackupCodes(): string[] {
  const codes: string[] = [];
  for (let i = 0; i < BACKUP_CODES_COUNT; i++) {
    codes.push(crypto.randomBytes(4).toString('hex').toUpperCase());
  }
  return codes;
}

function hashCode(code: string): string {
  return crypto.createHash('sha256').update(code).digest('hex');
}

export const twoFactorRouter = createTRPCRouter({
  // Get current 2FA status
  getStatus: tenantProcedure.query(async ({ ctx }) => {
    const setup = await ctx.prisma.twoFactorSetup.findUnique({
      where: { userId: ctx.auth.user.id },
      select: { isEnabled: true, enabledAt: true, method: true },
    });
    return { isEnabled: setup?.isEnabled ?? false, enabledAt: setup?.enabledAt, method: setup?.method };
  }),

  // Setup 2FA - generate secret and QR code
  setup: tenantProcedure.input(setupTwoFactorSchema).mutation(async ({ ctx, input }) => {
    const { method } = input;

    // Check if already has 2FA enabled
    const existing = await ctx.prisma.twoFactorSetup.findUnique({ where: { userId: ctx.auth.user.id } });
    if (existing?.isEnabled) {
      throw new TRPCError({ code: 'BAD_REQUEST', message: '2FA כבר מופעל' });
    }

    // Get user email for the label
    const user = await ctx.prisma.user.findUnique({ where: { id: ctx.auth.user.id }, select: { email: true } });
    if (!user) throw new TRPCError({ code: 'NOT_FOUND', message: 'משתמש לא נמצא' });

    // Generate secret
    const secret = authenticator.generateSecret();
    const otpauthUrl = authenticator.keyuri(user.email, 'ArchitectStudio', secret);

    // Generate QR code as data URL
    const qrCodeUrl = await QRCode.toDataURL(otpauthUrl);

    // Upsert the setup record (don't enable yet)
    await ctx.prisma.twoFactorSetup.upsert({
      where: { userId: ctx.auth.user.id },
      create: { userId: ctx.auth.user.id, method, secret, qrCodeUrl, isEnabled: false, backupCodes: [], usedBackupCodes: [] },
      update: { method, secret, qrCodeUrl, isEnabled: false },
    });

    return { secret, qrCodeUrl, otpauthUrl };
  }),

  // Verify code and enable 2FA
  verify: tenantProcedure.input(verifyTwoFactorSchema).mutation(async ({ ctx, input }) => {
    const { code } = input;

    const setup = await ctx.prisma.twoFactorSetup.findUnique({ where: { userId: ctx.auth.user.id } });
    if (!setup || !setup.secret) {
      throw new TRPCError({ code: 'BAD_REQUEST', message: 'יש להתחיל הגדרת 2FA קודם' });
    }

    if (setup.isEnabled) {
      throw new TRPCError({ code: 'BAD_REQUEST', message: '2FA כבר מופעל' });
    }

    // Verify the code
    const isValid = authenticator.verify({ token: code, secret: setup.secret });
    if (!isValid) {
      throw new TRPCError({ code: 'BAD_REQUEST', message: 'קוד לא תקין' });
    }

    // Generate backup codes
    const backupCodes = generateBackupCodes();
    const hashedBackupCodes = backupCodes.map(hashCode);

    // Enable 2FA
    await ctx.prisma.twoFactorSetup.update({
      where: { userId: ctx.auth.user.id },
      data: { isEnabled: true, enabledAt: new Date(), backupCodes: hashedBackupCodes, usedBackupCodes: [] },
    });

    return { success: true, backupCodes };
  }),

  // Disable 2FA
  disable: tenantProcedure.input(disableTwoFactorSchema).mutation(async ({ ctx, input }) => {
    const { code } = input;

    const setup = await ctx.prisma.twoFactorSetup.findUnique({ where: { userId: ctx.auth.user.id } });
    if (!setup || !setup.isEnabled || !setup.secret) {
      throw new TRPCError({ code: 'BAD_REQUEST', message: '2FA לא מופעל' });
    }

    // Verify the code
    const isValid = authenticator.verify({ token: code, secret: setup.secret });
    if (!isValid) {
      throw new TRPCError({ code: 'BAD_REQUEST', message: 'קוד לא תקין' });
    }

    // Disable 2FA and clear data
    await ctx.prisma.twoFactorSetup.update({
      where: { userId: ctx.auth.user.id },
      data: { isEnabled: false, enabledAt: null, secret: null, qrCodeUrl: null, backupCodes: [], usedBackupCodes: [] },
    });

    return { success: true };
  }),

  // Generate new backup codes
  generateBackupCodes: tenantProcedure.mutation(async ({ ctx }) => {
    const setup = await ctx.prisma.twoFactorSetup.findUnique({ where: { userId: ctx.auth.user.id } });
    if (!setup || !setup.isEnabled) {
      throw new TRPCError({ code: 'BAD_REQUEST', message: '2FA לא מופעל' });
    }

    const backupCodes = generateBackupCodes();
    const hashedBackupCodes = backupCodes.map(hashCode);

    await ctx.prisma.twoFactorSetup.update({
      where: { userId: ctx.auth.user.id },
      data: { backupCodes: hashedBackupCodes, usedBackupCodes: [] },
    });

    return { backupCodes };
  }),

  // Verify backup code (for login)
  verifyBackupCode: tenantProcedure.input(verifyBackupCodeSchema).mutation(async ({ ctx, input }) => {
    const { code } = input;

    const setup = await ctx.prisma.twoFactorSetup.findUnique({ where: { userId: ctx.auth.user.id } });
    if (!setup || !setup.isEnabled) {
      throw new TRPCError({ code: 'BAD_REQUEST', message: '2FA לא מופעל' });
    }

    const hashedCode = hashCode(code.toUpperCase());
    const isValidBackup = setup.backupCodes.includes(hashedCode) && !setup.usedBackupCodes.includes(hashedCode);

    if (!isValidBackup) {
      throw new TRPCError({ code: 'BAD_REQUEST', message: 'קוד גיבוי לא תקין או שכבר נעשה בו שימוש' });
    }

    // Mark the backup code as used
    await ctx.prisma.twoFactorSetup.update({
      where: { userId: ctx.auth.user.id },
      data: { usedBackupCodes: { push: hashedCode } },
    });

    const remainingCodes = setup.backupCodes.length - setup.usedBackupCodes.length - 1;
    return { success: true, remainingCodes };
  }),
});
