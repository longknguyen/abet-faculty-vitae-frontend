import type { HomeApi } from './HomeApi'
import { HttpHomeApi } from './HttpHomeApi'

export async function createHomeApi(): Promise<HomeApi> {
  const mockEnabled = import.meta.env.MODE === 'mock' || import.meta.env.VITE_USE_MOCK_API === 'true'

  if (import.meta.env.DEV && mockEnabled) {
    const { MockHomeApi } = await import('../testing/MockHomeApi')
    const scenario = new URLSearchParams(window.location.search).get('scenario')
      ?? import.meta.env.VITE_MOCK_HOME_SCENARIO
    return new MockHomeApi(scenario)
  }

  return new HttpHomeApi()
}
