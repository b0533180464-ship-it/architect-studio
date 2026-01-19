import { z } from 'zod';

export const tenantUpdateSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  logo: z.string().url().nullable().optional(),
  primaryColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/).nullable().optional(),
  email: z.string().email().optional(),
  phone: z.string().max(20).nullable().optional(),
  address: z.string().nullable().optional(),
  website: z.string().url().nullable().optional(),
  businessType: z.enum(['interior_design', 'architecture', 'both']).optional(),
  currency: z.string().length(3).optional(),
  vatRate: z.number().min(0).max(100).optional(),
  fiscalYearStart: z.number().min(1).max(12).optional(),
  language: z.string().max(5).optional(),
  timezone: z.string().max(50).optional(),
  dateFormat: z.string().max(20).optional(),
});

export const feeSettingsSchema = z.object({
  defaultBillingType: z.enum([
    'fixed', 'hourly', 'percentage', 'cost_plus', 'hybrid',
  ]).optional(),
  defaultHourlyRate: z.number().min(0).nullable().optional(),
  defaultMarkupPercent: z.number().min(0).max(100).optional(),
  markupType: z.enum(['cost_plus', 'discount_off_retail']).optional(),
  disbursementPercent: z.number().min(0).max(100).optional(),
  defaultRetainerPercent: z.number().min(0).max(100).optional(),
});

export const featuresSchema = z.object({
  timeTracking: z.boolean().optional(),
  permitTracking: z.boolean().optional(),
  clientPortal: z.boolean().optional(),
  advancedReporting: z.boolean().optional(),
  multipleLocations: z.boolean().optional(),
  customFields: z.boolean().optional(),
  apiAccess: z.boolean().optional(),
});

export const createTenantSchema = z.object({
  name: z.string().min(1).max(100),
  slug: z.string().min(2).max(100).regex(/^[a-z0-9-]+$/),
  email: z.string().email(),
  businessType: z.enum(['interior_design', 'architecture', 'both']),
});
