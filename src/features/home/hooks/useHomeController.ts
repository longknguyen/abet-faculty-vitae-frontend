import { useCallback, useEffect, useState } from 'react'

import { startNetBadgeAuthentication } from '../../auth/netBadgeAuthentication'
import { ApiError } from '../../../shared/http/ApiError'
import { createHomeApi } from '../api/createHomeApi'
import type { HomeData } from '../model/homeSchemas'
import type {FacultyOnboardingRequest} from "../api/HomeApi";

type LoadState =
  | { status: 'error'; message: string }
  | { status: 'loading' }
  | { status: 'ready'; data: HomeData }

export interface HomeController {
  loadState: LoadState
  retry: () => void
  onboardFaculty: (request: FacultyOnboardingRequest) => Promise<void>
  onboardingSubmitting: boolean
  onboardingError: string | null
}

function errorMessage(error: unknown): string {
  return error instanceof Error && error.name === 'AbortError'
    ? ''
    : 'We could not complete that request. No information was changed.'
}

export function useHomeController(): HomeController {
  const [requestNumber, setRequestNumber] = useState(0)
  const [loadState, setLoadState] = useState<LoadState>({ status: 'loading' })
  const [onboardingSubmitting, setOnboardingSubmitting] = useState(false)
  const [onboardingError, setOnboardingError] = useState<string | null>(null)

  useEffect(() => {
    const abortController = new AbortController()

    void createHomeApi()
      .then((createdApi) => {
        return createdApi.loadHome(abortController.signal)
      })
      .then((data) => {
        setLoadState({ data, status: 'ready' })
      })
      .catch((error: unknown) => {
        if (error instanceof ApiError && error.status === 401) {
          startNetBadgeAuthentication()
          return
        }
        const message = errorMessage(error)
        if (message !== '') {
          setLoadState({ message, status: 'error' })
        }
      })

    return () => {
      abortController.abort()
    }
  }, [requestNumber])

  const retry = useCallback(() => {
    setLoadState({ status: 'loading' })
    setRequestNumber((value) => value + 1)
  }, [])

  const onboardFaculty = useCallback(
      async (request: FacultyOnboardingRequest) => {
        setOnboardingSubmitting(true)
        setOnboardingError(null)
        try
        {
          const api = await createHomeApi()

          await api.onboardFaculty(request)

          const data = await api.loadHome()
          setLoadState({data, status: 'ready'})
        }
        catch
        {
          setOnboardingError('Could not finish loading your profile. Please try again later',)
        }
        finally {
          setOnboardingSubmitting(false)
        }
      },
      [],
  )

  return { loadState, retry, onboardFaculty,onboardingSubmitting,onboardingError }
}
