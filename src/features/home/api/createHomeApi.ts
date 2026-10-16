import type { HomeApi } from './HomeApi'
import { HttpHomeApi } from './HttpHomeApi'

export async function createHomeApi(): Promise<HomeApi> {
  if (import.meta.env.DEV && import.meta.env.VITE_USE_MOCK_API === 'true') {
    const { MockHomeApi } = await import('../testing/MockHomeApi')
    return new MockHomeApi(import.meta.env.VITE_MOCK_HOME_SCENARIO)
  }

  return new HttpHomeApi()
}
