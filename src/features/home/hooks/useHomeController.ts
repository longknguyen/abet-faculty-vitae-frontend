import { useCallback, useEffect, useRef, useState } from 'react'

import type { HomeApi } from '../api/HomeApi'
import { createHomeApi } from '../api/createHomeApi'
import type { HomeData } from '../model/homeSchemas'

type LoadState =
  | { status: 'error'; message: string }
  | { status: 'loading' }
  | { status: 'ready'; data: HomeData }

interface MutationState {
  error?: string
  pending: boolean
}

export interface HomeController {
  loadState: LoadState
  mutation: MutationState
  retry: () => void
  uploadCv: (facultyCycleRecordId: string, file: File) => Promise<boolean>
  verifyFacultyRecord: (facultyCycleRecordId: string, version: number) => Promise<boolean>
}

function errorMessage(error: unknown): string {
  return error instanceof Error && error.name === 'AbortError'
    ? ''
    : 'We could not complete that request. No information was changed.'
}

export function useHomeController(): HomeController {
  const api = useRef<HomeApi>(undefined)
  const [requestNumber, setRequestNumber] = useState(0)
  const [loadState, setLoadState] = useState<LoadState>({ status: 'loading' })
  const [mutation, setMutation] = useState<MutationState>({ pending: false })

  useEffect(() => {
    const abortController = new AbortController()

    void createHomeApi()
      .then((createdApi) => {
        api.current = createdApi
        return createdApi.loadHome(abortController.signal)
      })
      .then((data) => {
        setLoadState({ data, status: 'ready' })
      })
      .catch((error: unknown) => {
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

  const runMutation = useCallback(
    async (operation: (homeApi: HomeApi) => Promise<HomeData>): Promise<boolean> => {
      if (api.current === undefined) {
        return false
      }
      setMutation({ pending: true })
      try {
        const data = await operation(api.current)
        setLoadState({ data, status: 'ready' })
        setMutation({ pending: false })
        return true
      } catch (error: unknown) {
        setMutation({ error: errorMessage(error), pending: false })
        return false
      }
    },
    [],
  )

  const uploadCv = useCallback(
    (facultyCycleRecordId: string, file: File) =>
      runMutation((homeApi) => homeApi.uploadCv(facultyCycleRecordId, file)),
    [runMutation],
  )
  const verifyFacultyRecord = useCallback(
    (facultyCycleRecordId: string, version: number) =>
      runMutation((homeApi) => homeApi.verifyFacultyRecord(facultyCycleRecordId, version)),
    [runMutation],
  )

  return { loadState, mutation, retry, uploadCv, verifyFacultyRecord }
}
