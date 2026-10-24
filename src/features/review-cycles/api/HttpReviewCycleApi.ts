import { apiFetch } from '../../../shared/http/apiFetch'
import {
  provisionResultSchema,
  reviewCycleSchema,
  reviewCyclesSchema,
} from '../model/reviewCycleSchemas'
import type { ReviewCycleApi, ReviewCycleDraft } from './ReviewCycleApi'

export class HttpReviewCycleApi implements ReviewCycleApi {
  async list(signal?: AbortSignal) {
    const response = await apiFetch('/api/admin/review-cycles', { signal })
    return reviewCyclesSchema.parse(await response.json())
  }

  async create(request: ReviewCycleDraft, signal?: AbortSignal) {
    return this.write('/api/admin/review-cycles', 'POST', request, signal)
  }

  async update(id: string, request: ReviewCycleDraft, signal?: AbortSignal) {
    return this.write(`/api/admin/review-cycles/${id}`, 'PUT', request, signal)
  }

  async publish(id: string, signal?: AbortSignal) {
    return this.write(`/api/admin/review-cycles/${id}/publish`, 'POST', undefined, signal)
  }

  async retire(id: string, signal?: AbortSignal) {
    return this.write(`/api/admin/review-cycles/${id}/retire`, 'POST', undefined, signal)
  }

  async provision(id: string, signal?: AbortSignal) {
    const response = await apiFetch(`/api/admin/review-cycles/${id}/provision`, {
      method: 'POST',
      signal,
    })
    return provisionResultSchema.parse(await response.json())
  }

  private async write(
    path: string,
    method: 'POST' | 'PUT',
    request: ReviewCycleDraft | undefined,
    signal: AbortSignal | undefined,
  ) {
    const response = await apiFetch(path, {
      method,
      headers: request === undefined ? undefined : { 'content-type': 'application/json' },
      body: request === undefined ? undefined : JSON.stringify(request),
      signal,
    })
    return reviewCycleSchema.parse(await response.json())
  }
}
