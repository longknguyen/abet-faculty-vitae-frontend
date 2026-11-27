import { useOutletContext } from 'react-router-dom'

import type { FacultyOnboardingRequest } from '../features/home/api/HomeApi'
import type { HomeData } from '../features/home/model/homeSchemas'
import type { CvUploadState } from '../features/home/hooks/useHomeController'

export interface WorkspaceContext {
  data: HomeData
  onOnboardFaculty: (request: FacultyOnboardingRequest) => Promise<void>
  onboardingSubmitting: boolean
  onboardingError: string | null
  cvUploadState: CvUploadState
  onUploadCv: (file: File) => Promise<void>
}

export function useWorkspace(): WorkspaceContext {
  return useOutletContext<WorkspaceContext>()
}
