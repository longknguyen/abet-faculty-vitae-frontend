import { renderHook, waitFor } from '@testing-library/react'
import { act } from 'react'
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
    expect(result.current.loadState.status).toBe('opening')
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
  it('submits onboarding and reloads home data', async () => {
    const homeData = {
      currentUser: {
        id: '0199f80f-3bf3-7ed1-b5f8-060591415645',
        displayName: 'Test User',
        surname: 'User',
        roles: ['FACULTY'] as const,
      },
      cycle: null,
      personalVitae: null,
      facultyRecords: [],
      onboardingNeeded: true,
    }

    const loadHome = vi.fn()
        .mockResolvedValueOnce(homeData)
        .mockResolvedValueOnce({ ...homeData, onboardingNeeded: false })

    const onboardFaculty = vi.fn().mockResolvedValue({})
    vi.mocked(createHomeApi).mockResolvedValue({ loadHome, onboardFaculty })

    const { result } = renderHook(() => useHomeController())

    await waitFor(() => {
      expect(result.current.loadState.status).toBe('ready')
    })

    await act(async () => {
      await result.current.onboardFaculty({
        givenName: 'Test',
        familyName: 'User',
      })
    })

    expect(onboardFaculty).toHaveBeenCalledOnce()
    expect(loadHome).toHaveBeenCalledTimes(2)
    expect(result.current.loadState.status).toBe('ready')
  })
})
