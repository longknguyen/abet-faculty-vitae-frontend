import { z } from 'zod'

export const reviewCycleStatusSchema = z.enum(['DRAFT', 'PUBLISHED', 'RETIRED'])
export const reviewCycleSectionSchema = z.enum([
  'PROFILE',
  'EDUCATION',
  'EXPERIENCE',
  'CREDENTIAL',
  'PROFESSIONAL_DEVELOPMENT',
  'SERVICE',
  'PUBLICATION_PRESENTATION',
])

const formattingRulesSchema = z.record(z.string(), z.unknown())

export const reviewCycleSchema = z.object({
  id: z.uuid(),
  label: z.string().trim().min(1).max(50),
  departmentName: z.string().trim().min(1).max(200),
  revisionNumber: z.number().int().positive(),
  status: reviewCycleStatusSchema,
  requiredSections: z.array(reviewCycleSectionSchema).min(1),
  formattingRules: formattingRulesSchema,
  renderingTemplateName: z.string().trim().min(1).max(200),
  publishedAt: z.iso.datetime({ offset: true }).nullable(),
  provisionedFacultyCount: z.number().int().nonnegative(),
  totalFacultyCount: z.number().int().nonnegative(),
})

export const reviewCyclesSchema = z.array(reviewCycleSchema)

export const provisionResultSchema = z.object({
  reviewCycleId: z.uuid(),
  createdCount: z.number().int().nonnegative(),
  provisionedFacultyCount: z.number().int().nonnegative(),
  totalFacultyCount: z.number().int().nonnegative(),
})

export type ReviewCycle = z.infer<typeof reviewCycleSchema>
export type ReviewCycleSection = z.infer<typeof reviewCycleSectionSchema>
export type ProvisionResult = z.infer<typeof provisionResultSchema>
