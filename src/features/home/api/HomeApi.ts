import type { HomeData } from '../model/homeSchemas'

export interface HomeApi {
  loadHome(signal?: AbortSignal): Promise<HomeData>
  onboardFaculty(
      request: FacultyOnboardingRequest,
      signal?: AbortSignal,
  ): Promise<FacultyOnboardingResponse>
  uploadCv(file: File, signal?: AbortSignal): Promise<CvUploadReceipt>
  loadCvProcessingStatus(
    processingJobId: string,
    signal?: AbortSignal,
  ): Promise<CvProcessingStatus>
}

export type ProcessingJobStatus = 'FAILED' | 'QUEUED' | 'RUNNING' | 'SUCCEEDED'
export type ProcessingStage =
  | 'COMPLETE'
  | 'CREATING_REVIEW'
  | 'EXTRACTING_TEXT'
  | 'QUEUED'
  | 'STRUCTURING_WITH_AI'
  | 'VALIDATING'

export interface CvUploadReceipt {
  id: string
  processingJobId: string
  processingStatus: ProcessingJobStatus
  originalFilename: string
  detectedMimeType: string
  fileSizeBytes: number
  uploadedAt: string
}

export interface CvProcessingStatus {
  processingJobId: string
  status: ProcessingJobStatus
  currentStage: ProcessingStage
  errorMessage: string | null
  queuedAt: string
  startedAt: string | null
  completedAt: string | null
}

export interface FacultyOnboardingRequest {
  givenName: string,
  middleName?: string,
  familyName: string,
  suffix?: string,
  displayName?: string,
}

export interface FacultyOnboardingResponse {
  professorId?: string,
  displayName?: string,
  email?: string,
}
