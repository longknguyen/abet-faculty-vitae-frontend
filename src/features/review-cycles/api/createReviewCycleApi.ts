import { HttpReviewCycleApi } from './HttpReviewCycleApi'
import type { ReviewCycleApi } from './ReviewCycleApi'

export function createReviewCycleApi(): ReviewCycleApi {
  return new HttpReviewCycleApi()
}
