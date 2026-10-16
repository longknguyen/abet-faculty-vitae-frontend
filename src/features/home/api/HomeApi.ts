import type { HomeData } from '../model/homeSchemas'

export interface HomeApi {
  loadHome(signal?: AbortSignal): Promise<HomeData>
}
