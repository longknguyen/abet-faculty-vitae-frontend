import { render, screen } from '@testing-library/react'
import { afterEach, vi } from 'vitest'

import { rememberWorkspaceLoading } from '../features/auth/netBadgeAuthentication'
import { App } from './App'

vi.mock('../features/home/api/createHomeApi', () => ({
  createHomeApi: () => new Promise(() => undefined),
}))

afterEach(() => {
  globalThis.sessionStorage.clear()
})

describe('App', () => {
  it('renders a neutral opening state while authentication is unknown', () => {
    render(<App />)

    expect(screen.getByRole('status')).toHaveTextContent('Opening Vitae')
  })

  it('renders the workspace skeleton after authentication has started', () => {
    rememberWorkspaceLoading()

    render(<App />)

    expect(screen.getByRole('status')).toHaveTextContent('Loading your workspace')
  })
})
