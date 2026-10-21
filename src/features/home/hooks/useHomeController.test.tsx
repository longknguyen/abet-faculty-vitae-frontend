import { renderHook, waitFor } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { ApiError } from '../../../shared/http/ApiError'
import * as netBadgeAuthentication from '../../auth/netBadgeAuthentication'
import { createHomeApi } from '../api/createHomeApi'
import { useHomeController } from './useHomeController'

vi.mock('../api/createHomeApi')

afterEach(() => {
  vi.restoreAllMocks()
})

describe('useHomeController', () => {
  it('starts NetBadge authentication when the API returns unauthorized', async () => {
    const loadHome = vi.fn().mockRejectedValue(new ApiError('Authentication required', 401))
    vi.mocked(createHomeApi).mockResolvedValue({ loadHome,
                                                  onboardFaculty: vi.fn()})
    const startAuthentication = vi
      .spyOn(netBadgeAuthentication, 'startNetBadgeAuthentication')
      .mockImplementation(() => undefined)

    const { result } = renderHook(() => useHomeController())

    await waitFor(() => {
      expect(startAuthentication).toHaveBeenCalledOnce()
    })
    expect(result.current.loadState.status).toBe('loading')
  })

  it('shows an error instead of restarting login when access is forbidden', async () => {
    const loadHome = vi.fn().mockRejectedValue(new ApiError('Access denied', 403))
    vi.mocked(createHomeApi).mockResolvedValue({ loadHome,
                                                  onboardFaculty: vi.fn()})
    const startAuthentication = vi
      .spyOn(netBadgeAuthentication, 'startNetBadgeAuthentication')
      .mockImplementation(() => undefined)

    const { result } = renderHook(() => useHomeController())

    await waitFor(() => {
      expect(result.current.loadState.status).toBe('error')
    })
    expect(startAuthentication).not.toHaveBeenCalled()
  })
})
