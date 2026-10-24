import { render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { useWorkspace } from '../../../app/workspaceContext'
import type { HomeData } from '../../home/model/homeSchemas'
import { ReviewCyclesPage } from './ReviewCyclesPage'

vi.mock('../../../app/workspaceContext')
vi.mock('../components/ReviewCycleAdministration', () => ({
  ReviewCycleAdministration: () => <h1>Review cycles.</h1>,
}))

const data: HomeData = {
  currentUser: {
    id: '0199f80f-3bf3-7ed1-b5f8-060591413962',
    displayName: 'Test User',
    surname: 'User',
    roles: ['ADMIN'],
  },
  cycle: null,
  personalVitae: null,
  facultyRecords: [],
  onboardingNeeded: false,
}

function workspace(homeData: HomeData) {
  return {
    data: homeData,
    onOnboardFaculty: vi.fn(),
    onboardingSubmitting: false,
    onboardingError: null,
  }
}

afterEach(() => {
  vi.restoreAllMocks()
})

describe('ReviewCyclesPage', () => {
  it('renders cycle administration for administrators', () => {
    vi.mocked(useWorkspace).mockReturnValue(workspace(data))

    render(<ReviewCyclesPage />)

    expect(screen.getByRole('heading', { name: 'Review cycles.' })).toBeInTheDocument()
  })

  it('does not load cycle administration for faculty-only users', () => {
    vi.mocked(useWorkspace).mockReturnValue(workspace({
      ...data,
      currentUser: { ...data.currentUser, roles: ['FACULTY'] },
    }))

    render(<ReviewCyclesPage />)

    expect(screen.getByRole('heading', { name: 'Administrator access required.' })).toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: 'Review cycles.' })).not.toBeInTheDocument()
  })
})
