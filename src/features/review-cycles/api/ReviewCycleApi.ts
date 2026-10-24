import type {
  ProvisionResult,
  ReviewCycle,
  ReviewCycleSection,
} from '../model/reviewCycleSchemas'

export interface ReviewCycleDraft {
  label: string
  departmentName: string
  requiredSections: ReviewCycleSection[]
  formattingRules: Record<string, unknown>
  renderingTemplateName: string
}

export interface ReviewCycleApi {
  list(signal?: AbortSignal): Promise<ReviewCycle[]>
  create(request: ReviewCycleDraft, signal?: AbortSignal): Promise<ReviewCycle>
  update(id: string, request: ReviewCycleDraft, signal?: AbortSignal): Promise<ReviewCycle>
  publish(id: string, signal?: AbortSignal): Promise<ReviewCycle>
  retire(id: string, signal?: AbortSignal): Promise<ReviewCycle>
  provision(id: string, signal?: AbortSignal): Promise<ProvisionResult>
}
