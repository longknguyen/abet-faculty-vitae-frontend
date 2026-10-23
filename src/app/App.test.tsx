import { render, screen } from '@testing-library/react'
import { vi } from 'vitest'

import { App } from './App'

vi.mock('../features/home/api/createHomeApi', () => ({
  createHomeApi: () => new Promise(() => undefined),
}))

describe('App', () => {
  it('renders a neutral opening state while authentication is unknown', () => {
    render(<App />)

    expect(screen.getByRole('status')).toHaveTextContent('Opening Vitae')
  })
})
