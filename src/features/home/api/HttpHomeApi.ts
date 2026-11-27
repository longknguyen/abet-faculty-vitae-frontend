import { apiFetch } from '../../../shared/http/apiFetch'
import { homeDataSchema, type HomeData } from '../model/homeSchemas'
import { z } from 'zod'
import type {
  CvProcessingStatus,
  CvUploadReceipt,
  FacultyOnboardingRequest,
  FacultyOnboardingResponse,
  HomeApi,
} from './HomeApi'

const processingJobStatusSchema = z.enum(['FAILED', 'QUEUED', 'RUNNING', 'SUCCEEDED'])
const processingStageSchema = z.enum([
  'COMPLETE',
  'CREATING_REVIEW',
  'EXTRACTING_TEXT',
  'QUEUED',
  'STRUCTURING_WITH_AI',
  'VALIDATING',
])
const cvUploadReceiptSchema = z.object({
  id: z.uuid(),
  processingJobId: z.uuid(),
  processingStatus: processingJobStatusSchema,
  originalFilename: z.string(),
  detectedMimeType: z.string(),
  fileSizeBytes: z.number().nonnegative(),
  uploadedAt: z.iso.datetime(),
})
const cvProcessingStatusSchema = z.object({
  processingJobId: z.uuid(),
  status: processingJobStatusSchema,
  currentStage: processingStageSchema,
  errorMessage: z.string().nullable(),
  queuedAt: z.iso.datetime(),
  startedAt: z.iso.datetime().nullable(),
  completedAt: z.iso.datetime().nullable(),
})

async function parseHomeData(response: Response): Promise<HomeData> {
  return homeDataSchema.parse(await response.json())
}

export class HttpHomeApi implements HomeApi {
  async loadHome(signal?: AbortSignal): Promise<HomeData> {
    const response = await apiFetch('/api/home', { signal })
    return parseHomeData(response)
  }

  async onboardFaculty(request: FacultyOnboardingRequest, signal?: AbortSignal): Promise<FacultyOnboardingResponse> {
    const response = await apiFetch('/api/faculty/onboarding', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(request),
      signal,
    })

    return await response.json() as FacultyOnboardingResponse
  }

  async uploadCv(file: File, signal?: AbortSignal): Promise<CvUploadReceipt> {
    const formData = new FormData()
    formData.set('file', file)
    const response = await apiFetch('/api/cv-uploads', {
      method: 'POST',
      body: formData,
      signal,
    })
    return cvUploadReceiptSchema.parse(await response.json())
  }

  async loadCvProcessingStatus(
    processingJobId: string,
    signal?: AbortSignal,
  ): Promise<CvProcessingStatus> {
    const response = await apiFetch(
      `/api/cv-uploads/jobs/${encodeURIComponent(processingJobId)}`,
      { signal },
    )
    return cvProcessingStatusSchema.parse(await response.json())
  }
}
