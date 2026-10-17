import { useCallback, useEffect, useState } from 'react'

import { startNetBadgeAuthentication } from '../../auth/netBadgeAuthentication'
import { ApiError } from '../../../shared/http/ApiError'
import { createHomeApi } from '../api/createHomeApi'
import type { HomeData } from '../model/homeSchemas'

type LoadState =
  | { status: 'error'; message: string }
  | { status: 'loading' }
  | { status: 'ready'; data: HomeData }

export interface HomeController {
  loadState: LoadState
  retry: () => void
}

function errorMessage(error: unknown): string {
  return error instanceof Error && error.name === 'AbortError'
    ? ''
    : 'We could not complete that request. No information was changed.'
}

export function useHomeController(): HomeController {
  const [requestNumber, setRequestNumber] = useState(0)
  const [loadState, setLoadState] = useState<LoadState>({ status: 'loading' })

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

  return { loadState, retry }
}
