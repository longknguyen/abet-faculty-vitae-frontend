import type { HomeData } from '../model/homeSchemas'

export interface HomeApi {
  loadHome(signal?: AbortSignal): Promise<HomeData>
  onboardFaculty(
      request: FacultyOnboardingRequest,
      signal?: AbortSignal,
  ): Promise<FacultyOnboardingResponse>
}

export interface FacultyOnboardingRequest {
  givenName: string,
  middleName?: string,
  familyName: string,
  suffix?: string,
}

export interface FacultyOnboardingResponse {
  professorId?: string,
  displayName?: string,
  email?: string,
}
