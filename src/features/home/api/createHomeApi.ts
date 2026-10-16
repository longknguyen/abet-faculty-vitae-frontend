import type { HomeApi } from './HomeApi'
import { HttpHomeApi } from './HttpHomeApi'

export function createHomeApi(): Promise<HomeApi> {
  return Promise.resolve(new HttpHomeApi())
}
