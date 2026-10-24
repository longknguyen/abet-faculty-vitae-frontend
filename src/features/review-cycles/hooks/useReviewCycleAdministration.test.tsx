import { act, renderHook, waitFor } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { createReviewCycleApi } from '../api/createReviewCycleApi'
import type { ReviewCycleApi } from '../api/ReviewCycleApi'
import type { ReviewCycle } from '../model/reviewCycleSchemas'
import { useReviewCycleAdministration } from './useReviewCycleAdministration'

vi.mock('../api/createReviewCycleApi')

const cycle: ReviewCycle = {
  id: '0199f80f-4e52-7785-ad78-da3215e9e746',
  label: '2026–27',
  departmentName: 'Computer Science',
  revisionNumber: 1,
  status: 'DRAFT',
  requiredSections: ['PROFILE'],
  formattingRules: {},
  renderingTemplateName: 'faculty-vitae',
  publishedAt: null,
  provisionedFacultyCount: 0,
  totalFacultyCount: 2,
}

afterEach(() => {
  vi.restoreAllMocks()
})

describe('useReviewCycleAdministration', () => {
  it('loads review cycles and refreshes after a mutation', async () => {
    const list = vi.fn().mockResolvedValue([cycle])
    const publish = vi.fn().mockResolvedValue({ ...cycle, status: 'PUBLISHED' })
    const api: ReviewCycleApi = {
      list,
      create: vi.fn().mockResolvedValue(cycle),
      update: vi.fn().mockResolvedValue(cycle),
      publish,
      retire: vi.fn().mockResolvedValue({ ...cycle, status: 'RETIRED' }),
      provision: vi.fn().mockResolvedValue({
        reviewCycleId: cycle.id,
        createdCount: 2,
        provisionedFacultyCount: 2,
        totalFacultyCount: 2,
      }),
    }
    vi.mocked(createReviewCycleApi).mockReturnValue(api)

    const { result } = renderHook(() => useReviewCycleAdministration())

    await waitFor(() => { expect(result.current.loading).toBe(false) })
    expect(result.current.cycles).toEqual([cycle])

    await act(async () => {
      await result.current.publish(cycle.id)
    })

    expect(publish).toHaveBeenCalledWith(cycle.id)
    expect(list).toHaveBeenCalledTimes(2)
  })
})
