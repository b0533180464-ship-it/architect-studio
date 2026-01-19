import { z } from 'zod';

// Preprocess to convert empty strings to undefined
const emptyStringToUndefined = <T extends z.ZodTypeAny>(schema: T) =>
  z.preprocess((val) => (val === '' ? undefined : val), schema);

export const companyProfileSchema = z.object({
  name: z.string().min(1).max(100),
  logo: emptyStringToUndefined(z.string().url().optional()),
  businessType: z.enum(['interior_design', 'architecture', 'both']),
  teamSize: z.enum(['1', '2-5', '6-10', '11-20', '20+']),
  website: emptyStringToUndefined(z.string().url().optional()),
  phone: emptyStringToUndefined(z.string().max(20).optional()),
  address: emptyStringToUndefined(z.string().optional()),
});

export const brandingSchema = z.object({
  primaryColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
  secondaryColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
  logo: z.string().url().optional(),
});

export const pricingSchema = z.object({
  defaultBillingType: z.enum([
    'fixed', 'hourly', 'percentage', 'cost_plus', 'hybrid',
  ]),
  hourlyRate: z.number().min(0).optional(),
  markupPercent: z.number().min(0).max(100).optional(),
  currency: z.string().length(3),
  vatRate: z.number().min(0).max(100),
});

export const teamInviteSchema = z.object({
  email: z.string().email(),
  role: z.enum(['manager', 'member']),
});

export const teamInvitesSchema = z.object({
  invites: z.array(teamInviteSchema),
});

// Step 4: Project Phases
export const projectPhasesSchema = z.object({
  useDefault: z.boolean(),
  customPhases: z.array(z.object({
    name: z.string().min(1).max(50),
    color: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
  })).optional(),
});

// Step 6: Data Import
export const dataImportSchema = z.object({
  importClients: z.boolean(),
  importProducts: z.boolean(),
  source: z.enum(['csv', 'excel', 'other_system']).optional(),
});

// Step 7: Integrations
export const integrationsSchema = z.object({
  googleCalendar: z.boolean(),
  googleDrive: z.boolean(),
  quickbooks: z.boolean(),
  whatsapp: z.boolean(),
});

// Skip step schema
export const skipStepSchema = z.object({
  step: z.number().min(1).max(7),
});
