import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'

import { createHomeFixture, type MockScenario } from '../testing/MockHomeApi'
import { HomeExperience } from './HomeExperience'

function renderScenario(scenario: MockScenario) {
  render(<HomeExperience data={createHomeFixture(scenario)} />)
}

describe('HomeExperience', () => {
  it('shows a returning faculty member their API-provided review context', () => {
    renderScenario('returning')

    expect(screen.getByRole('heading', { name: /your faculty vitae/i })).toBeInTheDocument()
    expect(screen.getByText('Alex_Morgan_CV.pdf')).toBeInTheDocument()
    expect(screen.getByText('Confirm graduation year')).toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: /faculty overview/i })).not.toBeInTheDocument()
  })

  it('shows first-time faculty the future import journey without enabling it', () => {
    renderScenario('first-time')

    expect(screen.getByRole('button', { name: /import cv/i })).toBeDisabled()
    expect(screen.getAllByText('Import your CV', { selector: 'h2' })).not.toHaveLength(0)
    expect(screen.queryByText('Alex_Morgan_CV.pdf')).not.toBeInTheDocument()
    expect(screen.queryByText('Confirm graduation year')).not.toBeInTheDocument()
  })

  it('composes faculty and administrative views for a user with both roles', () => {
    renderScenario('combined')

    expect(screen.getByRole('heading', { name: /your faculty vitae/i })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: /faculty overview/i })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /my vitae/i })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /^faculty$/i })).toBeInTheDocument()
    const dialogTitleIds = Array.from(document.querySelectorAll('dialog h2'), (heading) => heading.id)
    expect(new Set(dialogTitleIds).size).toBe(dialogTitleIds.length)
  })

  it('filters and searches administrator records', async () => {
    const user = userEvent.setup()
    renderScenario('admin')

    expect(screen.queryByRole('heading', { name: /your faculty vitae/i })).not.toBeInTheDocument()
    const table = screen.getByRole('table')
    expect(within(table).getByText('Maya Patel')).toBeInTheDocument()
    expect(within(table).getByText('Sam Rivera')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /verified 1/i }))
    expect(within(table).queryByText('Maya Patel')).not.toBeInTheDocument()
    expect(within(table).getByText('Sam Rivera')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /all faculty 3/i }))
    await user.type(screen.getByRole('searchbox', { name: /search faculty/i }), 'Jordan')
    expect(within(table).getByText('Jordan Lee')).toBeInTheDocument()
    expect(within(table).queryByText('Sam Rivera')).not.toBeInTheDocument()
    expect(screen.getByText('Showing 1 of 3 faculty')).toBeInTheDocument()
  })

})
