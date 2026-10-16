import { apiFetch } from '../../../shared/http/apiFetch'
import { homeDataSchema, type HomeData } from '../model/homeSchemas'
import type { HomeApi } from './HomeApi'

async function parseHomeData(response: Response): Promise<HomeData> {
  return homeDataSchema.parse(await response.json())
}

export class HttpHomeApi implements HomeApi {
  async loadHome(signal?: AbortSignal): Promise<HomeData> {
    const response = await apiFetch('/api/v1/home', { signal })
    return parseHomeData(response)
  }

  async uploadCv(
    facultyCycleRecordId: string,
    file: File,
    signal?: AbortSignal,
  ): Promise<HomeData> {
    const body = new FormData()
    body.set('file', file)
    const response = await apiFetch(
      `/api/v1/faculty-cycle-records/${encodeURIComponent(facultyCycleRecordId)}/cv-uploads`,
      { body, method: 'POST', signal },
    )
    return parseHomeData(response)
  }

  async verifyFacultyRecord(
    facultyCycleRecordId: string,
    version: number,
    signal?: AbortSignal,
  ): Promise<HomeData> {
    const response = await apiFetch(
      `/api/v1/faculty-cycle-records/${encodeURIComponent(facultyCycleRecordId)}/verification`,
      {
        body: JSON.stringify({ version }),
        headers: { 'Content-Type': 'application/json' },
        method: 'POST',
        signal,
      },
    )
    return parseHomeData(response)
  }
}
