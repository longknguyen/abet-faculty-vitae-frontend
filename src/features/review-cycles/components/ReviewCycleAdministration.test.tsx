import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { useReviewCycleAdministration } from '../hooks/useReviewCycleAdministration'
import type { ReviewCycle } from '../model/reviewCycleSchemas'
import { ReviewCycleAdministration } from './ReviewCycleAdministration'

vi.mock('../hooks/useReviewCycleAdministration')

const draft: ReviewCycle = {
  id: '0199f80f-4e52-7785-ad78-da3215e9e746',
  label: '2026–27',
  departmentName: 'Computer Science',
  revisionNumber: 1,
  status: 'DRAFT',
  requiredSections: ['PROFILE', 'EDUCATION'],
  formattingRules: { pageLimit: 2 },
  renderingTemplateName: 'faculty-vitae',
  publishedAt: null,
  provisionedFacultyCount: 0,
  totalFacultyCount: 12,
}

function controller(cycles: ReviewCycle[] = [draft]) {
  return {
    cycles,
    error: null,
    loading: false,
    pendingAction: null,
    create: vi.fn().mockResolvedValue(true),
    update: vi.fn().mockResolvedValue(true),
    publish: vi.fn().mockResolvedValue(undefined),
    retire: vi.fn().mockResolvedValue(undefined),
    provision: vi.fn().mockResolvedValue(undefined),
    retry: vi.fn(),
  }
}

afterEach(() => {
  vi.restoreAllMocks()
})

describe('ReviewCycleAdministration', () => {
  it('shows cycle status, revision and draft actions', () => {
    vi.mocked(useReviewCycleAdministration).mockReturnValue(controller())

    render(<ReviewCycleAdministration />)

    expect(screen.getByRole('heading', { name: 'Review cycles' })).toBeInTheDocument()
    expect(screen.getByText('2026–27')).toBeInTheDocument()
    expect(screen.getByText(/revision 1/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Edit' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Publish' })).toBeInTheDocument()
  })

  it('submits a validated new draft', async () => {
    const mockedController = controller([])
    vi.mocked(useReviewCycleAdministration).mockReturnValue(mockedController)

    render(<ReviewCycleAdministration />)
    fireEvent.click(screen.getByRole('button', { name: 'New draft' }))
    fireEvent.change(screen.getByLabelText('Cycle label'), { target: { value: '2027–28' } })
    fireEvent.change(screen.getByLabelText('Department'), { target: { value: 'Computer Science' } })
    fireEvent.click(screen.getByRole('button', { name: 'Create draft' }))

    await waitFor(() => {
      expect(mockedController.create).toHaveBeenCalledWith(expect.objectContaining({
        label: '2027–28',
        departmentName: 'Computer Science',
        renderingTemplateName: 'faculty-vitae',
      }))
    })
  })

  it('does not submit malformed formatting rules', async () => {
    const mockedController = controller([])
    vi.mocked(useReviewCycleAdministration).mockReturnValue(mockedController)

    render(<ReviewCycleAdministration />)
    fireEvent.click(screen.getByRole('button', { name: 'New draft' }))
    fireEvent.change(screen.getByLabelText('Cycle label'), { target: { value: '2027–28' } })
    fireEvent.change(screen.getByLabelText('Department'), { target: { value: 'Computer Science' } })
    fireEvent.change(screen.getByLabelText('Formatting rules'), { target: { value: '{' } })
    fireEvent.click(screen.getByRole('button', { name: 'Create draft' }))

    expect(await screen.findByRole('alert')).toHaveTextContent('valid JSON')
    expect(mockedController.create).not.toHaveBeenCalled()
  })
})
