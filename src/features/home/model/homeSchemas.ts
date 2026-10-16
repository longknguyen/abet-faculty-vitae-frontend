import { z } from 'zod'

export const roleNameSchema = z.enum(['ADMIN', 'FACULTY'])
export const facultyCycleStatusSchema = z.enum(['DRAFT', 'SUBMITTED', 'VERIFIED'])
export const processingJobStatusSchema = z.enum(['QUEUED', 'RUNNING', 'SUCCEEDED', 'FAILED'])
export const processingStageSchema = z.enum([
  'QUEUED',
  'VALIDATING',
  'EXTRACTING_TEXT',
  'STRUCTURING_WITH_AI',
  'CREATING_REVIEW',
  'COMPLETE',
])
export const reviewSectionTypeSchema = z.enum([
  'PROFILE',
  'EDUCATION',
  'EXPERIENCE',
  'CREDENTIAL',
  'PROFESSIONAL_DEVELOPMENT',
  'SERVICE',
  'PUBLICATION_PRESENTATION',
])

const nonBlankText = z.string().trim().min(1).max(255)
const nullableIsoInstant = z.iso.datetime({ offset: true }).nullable()

export const homeDataSchema = z.object({
  currentUser: z.object({
    id: z.uuid(),
    displayName: nonBlankText,
    surname: nonBlankText.nullable(),
    roles: z.array(roleNameSchema).min(1),
  }),
  cycle: z
    .object({
      id: z.uuid(),
      label: nonBlankText,
      departmentName: nonBlankText,
    })
    .nullable(),
  personalVitae: z
    .object({
      facultyCycleRecordId: z.uuid(),
      status: facultyCycleStatusSchema,
      contentRevision: z.number().int().nonnegative(),
      sourceCv: z
        .object({
          uploadId: z.uuid(),
          originalFilename: nonBlankText,
          jobStatus: processingJobStatusSchema,
          processingStage: processingStageSchema,
        })
        .nullable(),
      nextReviewItem: z
        .object({
          reviewId: z.uuid(),
          reviewItemId: z.uuid(),
          section: reviewSectionTypeSchema,
          title: nonBlankText,
          detail: nonBlankText,
        })
        .nullable(),
      previewSections: z
        .array(
          z.object({
            heading: nonBlankText,
            lines: z.array(nonBlankText).max(8),
          }),
        )
        .max(8),
    })
    .nullable(),
  facultyRecords: z.array(
    z.object({
      professorId: z.uuid(),
      facultyCycleRecordId: z.uuid().nullable(),
      displayName: nonBlankText,
      status: facultyCycleStatusSchema.nullable(),
      updatedAt: nullableIsoInstant,
      version: z.number().int().nonnegative().nullable(),
    }),
  ),
})

export type HomeData = z.infer<typeof homeDataSchema>
export type RoleName = z.infer<typeof roleNameSchema>
export type FacultyCycleStatus = z.infer<typeof facultyCycleStatusSchema>
export type FacultyRecord = HomeData['facultyRecords'][number]
