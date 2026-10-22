import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import type { HomeData } from '../model/homeSchemas'
import { HomeExperience } from './HomeExperience'

const emptyHome: HomeData = {
  currentUser: {
    id: '0199f80f-3bf3-7ed1-b5f8-060591413962',
    displayName: 'Test User',
    surname: 'User',
    roles: ['FACULTY', 'ADMIN'],
  },
  cycle: null,
  personalVitae: null,
  facultyRecords: [],
  onboardingNeeded: false,

}

describe('HomeExperience', () => {
  it('renders the empty home returned by the API', () => {
    render(<HomeExperience data={emptyHome}
                           onOnboardFaculty={async () => {}}
                           onboardingSubmitting={false}
                           onboardingError={null}/>)

    expect(screen.getByRole('heading', { name: /your faculty vitae/i })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: /faculty overview/i })).toBeInTheDocument()
    expect(screen.getAllByText(/no active (ABET )?review cycle/i)).not.toHaveLength(0)
    expect(screen.getByText('No vitae awaiting review')).toBeInTheDocument()
    expect(screen.getByText('Showing 0 of 0 faculty')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /theme/i })).not.toBeInTheDocument()
  })

  it('shows the onboarding form when onboarding is needed', () => {
    const onboardingHome: HomeData = {
      ...emptyHome,
      currentUser: {
        ...emptyHome.currentUser,
        roles: ['FACULTY'],
      },
      onboardingNeeded: true,
    }

    render(
        <HomeExperience
            data={onboardingHome}
            onOnboardFaculty={async () => {}}
            onboardingSubmitting={false}
            onboardingError={null}
        />,
    )

    expect(
        screen.getByRole('heading', { name: /your facultyprofile/i }),
    ).toBeInTheDocument()

    expect(
        screen.queryByRole('heading', { name: /your faculty vitae/i }),
    ).not.toBeInTheDocument()
  })
})
