import { apiFetch } from '../../../shared/http/apiFetch'
import { homeDataSchema, type HomeData } from '../model/homeSchemas'
import type { HomeApi } from './HomeApi'

async function parseHomeData(response: Response): Promise<HomeData> {
  return homeDataSchema.parse(await response.json())
}

export class HttpHomeApi implements HomeApi {
  async loadHome(signal?: AbortSignal): Promise<HomeData> {
    const response = await apiFetch('/api/home', { signal })
    return parseHomeData(response)
  }
}
