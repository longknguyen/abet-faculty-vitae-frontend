import { apiFetch } from '../../../shared/http/apiFetch'
import { homeDataSchema, type HomeData } from '../model/homeSchemas'
import type { FacultyOnboardingRequest, FacultyOnboardingResponse, HomeApi } from './HomeApi'

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
}
