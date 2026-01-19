import { z } from 'zod';

// Setup 2FA - initiate setup, returns QR code
export const setupTwoFactorSchema = z.object({
  method: z.enum(['totp', 'sms']).default('totp'),
  phoneNumber: z.string().optional(),
});

// Verify 2FA - verify the code and enable 2FA
export const verifyTwoFactorSchema = z.object({
  code: z.string().min(6).max(6),
});

// Disable 2FA
export const disableTwoFactorSchema = z.object({
  code: z.string().min(6).max(6),
});

// Verify backup code
export const verifyBackupCodeSchema = z.object({
  code: z.string().min(8).max(12),
});

// Types
export type SetupTwoFactorInput = z.infer<typeof setupTwoFactorSchema>;
export type VerifyTwoFactorInput = z.infer<typeof verifyTwoFactorSchema>;
export type DisableTwoFactorInput = z.infer<typeof disableTwoFactorSchema>;
export type VerifyBackupCodeInput = z.infer<typeof verifyBackupCodeSchema>;
