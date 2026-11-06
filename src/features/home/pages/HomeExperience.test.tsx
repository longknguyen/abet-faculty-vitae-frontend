import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import type { HomeData } from '../model/homeSchemas'
import { HomeExperience } from './HomeExperience'

const idleUpload = { status: 'idle' } as const

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
                           onboardingError={null}
                           cvUploadState={idleUpload}
                           onUploadCv={async () => {}} />)

    expect(screen.getByRole('heading', { name: /your faculty vitae/i })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: /faculty overview/i })).toBeInTheDocument()
    expect(screen.getAllByText(/no active (ABET )?review cycle/i)).not.toHaveLength(0)
    expect(screen.getByText('No vitae awaiting review')).toBeInTheDocument()
    expect(screen.getByText('Showing 0 of 0 faculty')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /theme/i })).not.toBeInTheDocument()
  })

  it('shows the overview before opening the prefilled onboarding form', () => {
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
            cvUploadState={idleUpload}
            onUploadCv={async () => {}}
        />,
    )

    expect(screen.getByRole('heading', { name: /your faculty vitae/i })).toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: /before you import/i })).not.toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: /import cv/i }))

    expect(screen.getByRole('heading', { name: /your faculty profile/i })).toBeInTheDocument()
    expect(screen.getByLabelText(/given name/i)).toHaveValue('Test')
    expect(screen.getByLabelText(/family name/i)).toHaveValue('User')
    expect(screen.getByLabelText(/name shown on your vitae/i)).toHaveValue('Test User')

    fireEvent.click(screen.getByRole('button', { name: /back to overview/i }))

    expect(screen.getByRole('heading', { name: /your faculty vitae/i })).toBeInTheDocument()
  })

  it('opens the CV upload form after profile setup is complete', () => {
    const activeCycleHome: HomeData = {
      ...emptyHome,
      currentUser: { ...emptyHome.currentUser, roles: ['FACULTY'] },
      cycle: {
        id: '0199f80f-3bf3-7ed1-b5f8-060591413963',
        label: '2027–28',
        departmentName: 'Computer Science',
      },
    }

    render(
      <HomeExperience
        data={activeCycleHome}
        onOnboardFaculty={async () => {}}
        onboardingSubmitting={false}
        onboardingError={null}
        cvUploadState={idleUpload}
        onUploadCv={async () => {}}
      />,
    )

    fireEvent.click(screen.getByRole('button', { name: /import cv/i }))

    expect(screen.getByRole('dialog', { name: 'Import CV' })).toBeInTheDocument()
    expect(screen.getByLabelText(/choose a file/i)).toHaveAttribute('accept', expect.stringContaining('.docx'))
  })
})
