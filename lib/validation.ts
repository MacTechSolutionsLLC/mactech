import { z } from 'zod'

// Basic spam protection: simple honeypot and rate limiting helpers
export const contactFormSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  email: z.string().email('Invalid email address'),
  organization: z.string().max(200).optional(),
  phone: z.string().max(20).optional(),
  message: z.string().min(10, 'Message must be at least 10 characters').max(2000),
  honeypot: z.string().max(0).optional(), // Honeypot field for spam protection
}).transform((data) => ({
  ...data,
  organization: data.organization?.trim() || undefined,
  phone: data.phone?.trim() || undefined,
  honeypot: data.honeypot || undefined,
}))

export const cmmcPathEnum = z.enum([
  'federal-capture-platform',
  'deployable-cui-vault',
  'cmmc-compliance-package',
])

export const readinessAssessmentSchema = z.object({
  email: z.string().email('Invalid email address'),
  name: z.string().min(2).max(100).optional(),
  organization: z.string().max(200).optional(),
  interestPath: cmmcPathEnum,
  systemType: z.enum(['new-system', 'existing-system', 'legacy-system', 'cloud-migration']),
  authStatus: z.enum(['not-started', 'in-progress', 'renewal', 'troubled']),
  auditHistory: z.enum(['no-audits', 'passed-recently', 'failed-recently', 'mixed']),
  infraMaturity: z.enum(['ad-hoc', 'documented', 'standardized', 'optimized']),
  timelinePressure: z.enum(['no-rush', 'months', 'weeks', 'urgent']),
  honeypot: z.string().max(0).optional(),
})

export type ContactFormData = z.infer<typeof contactFormSchema>
export type ReadinessAssessmentData = z.infer<typeof readinessAssessmentSchema>

