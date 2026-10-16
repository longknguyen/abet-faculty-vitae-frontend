import { render, screen } from '@testing-library/react'
import { vi } from 'vitest'

import { App } from './App'

vi.mock('../features/home/api/createHomeApi', () => ({
  createHomeApi: () => new Promise(() => undefined),
}))

describe('App', () => {
  it('renders the initial loading state', () => {
    render(<App />)

    expect(screen.getByRole('status')).toHaveTextContent('Loading your workspace')
  })
})
