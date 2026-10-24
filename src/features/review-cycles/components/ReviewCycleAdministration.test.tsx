import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { useReviewCycleAdministration } from '../hooks/useReviewCycleAdministration'
import type { ReviewCycle } from '../model/reviewCycleSchemas'
import { ReviewCycleAdministration } from './ReviewCycleAdministration'

vi.mock('../hooks/useReviewCycleAdministration')

const draft: ReviewCycle = {
  id: '0199f80f-4e52-7785-ad78-da3215e9e746',
  label: '2027–28',
  startDate: '2027-07-01',
  endDate: '2028-06-30',
  submissionDeadline: '2028-03-15',
  departmentName: 'Computer Science',
  revisionNumber: 2,
  status: 'DRAFT',
  requiredSections: ['PROFILE', 'EDUCATION'],
  formattingRules: { pageLimit: 2 },
  renderingTemplateName: 'faculty-vitae',
  publishedAt: null,
  provisionedFacultyCount: 0,
  totalFacultyCount: 12,
}

const current: ReviewCycle = {
  ...draft,
  id: '0199f80f-4e52-7785-ad78-da3215e9e747',
  label: '2026–27',
  startDate: '2026-07-01',
  endDate: '2027-06-30',
  submissionDeadline: '2027-03-15',
  revisionNumber: 1,
  status: 'PUBLISHED',
  publishedAt: '2026-07-01T12:00:00Z',
  provisionedFacultyCount: 10,
}

function controller(cycles: ReviewCycle[] = [current, draft]) {
  return {
    cycles,
    error: null,
    loading: false,
    pendingAction: null,
    create: vi.fn().mockResolvedValue(true),
    update: vi.fn().mockResolvedValue(true),
    publish: vi.fn().mockResolvedValue(true),
    retire: vi.fn().mockResolvedValue(true),
    provision: vi.fn().mockResolvedValue({
      reviewCycleId: current.id,
      createdCount: 2,
      provisionedFacultyCount: 12,
      totalFacultyCount: 12,
    }),
    retry: vi.fn(),
  }
}

afterEach(() => {
  vi.restoreAllMocks()
})

describe('ReviewCycleAdministration', () => {
  it('separates the current cycle from manageable drafts', () => {
    vi.mocked(useReviewCycleAdministration).mockReturnValue(controller())

    render(<ReviewCycleAdministration />)

    expect(screen.getByRole('heading', { name: 'Review cycles.' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: '2026–27' })).toBeInTheDocument()
    expect(screen.getByText('March 15, 2027')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Manage 2027–28' })).toBeInTheDocument()
    expect(screen.getByText('July 1, 2027 – June 30, 2028')).toBeInTheDocument()
  })

  it('creates a draft with the reference form fields', async () => {
    const mockedController = controller()
    vi.mocked(useReviewCycleAdministration).mockReturnValue(mockedController)

    render(<ReviewCycleAdministration />)
    fireEvent.click(screen.getByRole('button', { name: 'New cycle' }))
    fireEvent.change(screen.getByLabelText('Cycle name'), { target: { value: '2028–29' } })
    fireEvent.change(screen.getByLabelText('Start date'), { target: { value: '2028-07-01' } })
    fireEvent.change(screen.getByLabelText('End date'), { target: { value: '2029-06-30' } })
    fireEvent.change(screen.getByLabelText(/Submission deadline/), { target: { value: '2029-03-15' } })
    expect(screen.queryByLabelText('Department')).not.toBeInTheDocument()
    const form = screen.getByLabelText('Cycle name').closest('form')
    if (form === null) throw new Error('Expected the new-cycle form')
    fireEvent.submit(form)

    await waitFor(() => {
      expect(mockedController.create).toHaveBeenCalledWith(expect.objectContaining({
        label: '2028–29',
        startDate: '2028-07-01',
        endDate: '2029-06-30',
        submissionDeadline: '2029-03-15',
      }))
    })
    expect(await screen.findByRole('status')).toHaveTextContent('2028–29 was saved as a draft')
  })

  it('does not submit a deadline outside the review period', async () => {
    const mockedController = controller()
    vi.mocked(useReviewCycleAdministration).mockReturnValue(mockedController)

    render(<ReviewCycleAdministration />)
    fireEvent.click(screen.getByRole('button', { name: 'New cycle' }))
    fireEvent.change(screen.getByLabelText('Cycle name'), { target: { value: '2028–29' } })
    fireEvent.change(screen.getByLabelText('Start date'), { target: { value: '2028-07-01' } })
    fireEvent.change(screen.getByLabelText('End date'), { target: { value: '2029-06-30' } })
    fireEvent.change(screen.getByLabelText(/Submission deadline/), { target: { value: '2029-07-01' } })
    const form = screen.getByLabelText('Cycle name').closest('form')
    if (form === null) throw new Error('Expected the new-cycle form')
    fireEvent.submit(form)

    expect(await screen.findByRole('alert')).toHaveTextContent('within the review period')
    expect(mockedController.create).not.toHaveBeenCalled()
  })

  it('requires confirmation before making a draft current', async () => {
    const mockedController = controller()
    vi.mocked(useReviewCycleAdministration).mockReturnValue(mockedController)

    render(<ReviewCycleAdministration />)
    fireEvent.click(screen.getByRole('button', { name: 'Manage 2027–28' }))
    fireEvent.click(screen.getByRole('button', { name: 'Make current' }))

    expect(screen.getByText(/existing faculty records will stay/i)).toBeInTheDocument()
    expect(mockedController.publish).not.toHaveBeenCalled()

    fireEvent.click(screen.getByRole('button', { name: 'Make current' }))

    await waitFor(() => {
      expect(mockedController.publish).toHaveBeenCalledWith(draft.id)
    })
  })
})
