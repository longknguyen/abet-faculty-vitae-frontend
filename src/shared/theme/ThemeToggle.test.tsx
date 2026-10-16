import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it } from 'vitest'

import { ThemeToggle } from './ThemeToggle'

afterEach(() => {
  document.documentElement.className = ''
  window.localStorage.clear()
})

describe('ThemeToggle', () => {
  it('applies and persists the selected theme', async () => {
    const user = userEvent.setup()
    render(<ThemeToggle />)

    await user.click(screen.getByRole('button', { name: /switch to dark theme/i }))

    expect(document.documentElement).toHaveClass('dark')
    expect(window.localStorage.getItem('vitae-theme')).toBe('dark')
    expect(screen.getByRole('button', { name: /switch to light theme/i })).toBeInTheDocument()
  })
})
