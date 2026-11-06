import { useCallback, useEffect, useRef, useState } from 'react'

import {
  rememberWorkspaceLoading,
  shouldShowWorkspaceLoading,
  startNetBadgeAuthentication,
} from '../../auth/netBadgeAuthentication'
import { ApiError } from '../../../shared/http/ApiError'
import { createHomeApi } from '../api/createHomeApi'
import type { FacultyOnboardingRequest } from '../api/HomeApi'
import type { ProcessingStage } from '../api/HomeApi'
import type { HomeData } from '../model/homeSchemas'

type LoadState =
  | { status: 'error'; message: string }
  | { status: 'loading' }
  | { status: 'opening' }
  | { status: 'ready'; data: HomeData }

export interface HomeController {
  loadState: LoadState
  retry: () => void
  onboardFaculty: (request: FacultyOnboardingRequest) => Promise<void>
  onboardingSubmitting: boolean
  onboardingError: string | null
  cvUploadState: CvUploadState
  uploadCv: (file: File) => Promise<void>
}

export type CvUploadState =
  | { status: 'idle' }
  | { status: 'uploading'; filename: string }
  | { status: 'processing'; filename: string; stage: ProcessingStage }
  | { status: 'complete'; filename: string }
  | { status: 'failed'; filename: string; message: string }

function waitForNextPoll(signal: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    const onAbort = () => {
      globalThis.clearTimeout(timeout)
      reject(new DOMException('Polling cancelled', 'AbortError'))
    }
    const timeout = globalThis.setTimeout(() => {
      signal.removeEventListener('abort', onAbort)
      resolve()
    }, 1_200)
    signal.addEventListener('abort', onAbort, { once: true })
  })
}

function errorMessage(error: unknown): string {
  return error instanceof Error && error.name === 'AbortError'
    ? ''
    : 'We could not complete that request. No information was changed.'
}

function initialLoadState(): LoadState {
  return { status: shouldShowWorkspaceLoading() ? 'loading' : 'opening' }
}

export function useHomeController(): HomeController {
  const [requestNumber, setRequestNumber] = useState(0)
  const [loadState, setLoadState] = useState<LoadState>(initialLoadState)
  const [onboardingSubmitting, setOnboardingSubmitting] = useState(false)
  const [onboardingError, setOnboardingError] = useState<string | null>(null)
  const [cvUploadState, setCvUploadState] = useState<CvUploadState>({ status: 'idle' })
  const processingAbortController = useRef<AbortController | null>(null)

  useEffect(() => () => {
    processingAbortController.current?.abort()
  }, [])

  useEffect(() => {
    const abortController = new AbortController()
    let active = true

    void createHomeApi()
      .then((createdApi) => {
        return createdApi.loadHome(abortController.signal)
      })
      .then((data) => {
        if (active) {
          rememberWorkspaceLoading()
          setLoadState({ data, status: 'ready' })
        }
      })
      .catch((error: unknown) => {
        if (!active) {
          return
        }
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
      active = false
      abortController.abort()
    }
  }, [requestNumber])

  const retry = useCallback(() => {
    setLoadState(initialLoadState())
    setRequestNumber((value) => value + 1)
  }, [])

  const onboardFaculty = useCallback(
    async (request: FacultyOnboardingRequest) => {
      setOnboardingSubmitting(true)
      setOnboardingError(null)
      try {
        const api = await createHomeApi()

        await api.onboardFaculty(request)

        const data = await api.loadHome()
        setLoadState({ data, status: 'ready' })
      } catch {
        setOnboardingError('Could not finish loading your profile. Please try again later')
      } finally {
        setOnboardingSubmitting(false)
      }
    },
    [],
  )

  const uploadCv = useCallback(async (file: File) => {
    processingAbortController.current?.abort()
    const abortController = new AbortController()
    processingAbortController.current = abortController
    setCvUploadState({ status: 'uploading', filename: file.name })

    try {
      const api = await createHomeApi()
      const receipt = await api.uploadCv(file, abortController.signal)
      setCvUploadState({
        status: 'processing',
        filename: receipt.originalFilename,
        stage: 'QUEUED',
      })

      while (!abortController.signal.aborted) {
        await waitForNextPoll(abortController.signal)
        const status = await api.loadCvProcessingStatus(
          receipt.processingJobId,
          abortController.signal,
        )
        if (status.status === 'FAILED') {
          setCvUploadState({
            status: 'failed',
            filename: receipt.originalFilename,
            message: status.errorMessage ?? 'The CV could not be processed.',
          })
          return
        }
        if (status.status === 'SUCCEEDED' || status.currentStage === 'COMPLETE') {
          setCvUploadState({ status: 'complete', filename: receipt.originalFilename })
          try {
            const data = await api.loadHome(abortController.signal)
            setLoadState({ data, status: 'ready' })
          } catch (error) {
            if (error instanceof Error && error.name === 'AbortError') return
          }
          return
        }
        setCvUploadState({
          status: 'processing',
          filename: receipt.originalFilename,
          stage: status.currentStage,
        })
      }
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') return
      setCvUploadState({
        status: 'failed',
        filename: file.name,
        message: 'The CV could not be uploaded. Review the file and try again.',
      })
    }
  }, [])

  return {
    loadState,
    retry,
    onboardFaculty,
    onboardingSubmitting,
    onboardingError,
    cvUploadState,
    uploadCv,
  }
}
