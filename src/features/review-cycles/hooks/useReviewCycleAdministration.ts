import { useCallback, useEffect, useState } from 'react'

import { createReviewCycleApi } from '../api/createReviewCycleApi'
import type { ReviewCycleDraft } from '../api/ReviewCycleApi'
import type { ReviewCycle } from '../model/reviewCycleSchemas'

interface ReviewCycleAdministrationState {
  cycles: ReviewCycle[]
  error: string | null
  loading: boolean
  pendingAction: string | null
  create: (request: ReviewCycleDraft) => Promise<boolean>
  update: (id: string, request: ReviewCycleDraft) => Promise<boolean>
  publish: (id: string) => Promise<void>
  retire: (id: string) => Promise<void>
  provision: (id: string) => Promise<void>
  retry: () => void
}

function requestErrorMessage(): string {
  return 'The review-cycle request could not be completed. Please try again.'
}

export function useReviewCycleAdministration(): ReviewCycleAdministrationState {
  const [cycles, setCycles] = useState<ReviewCycle[]>([])
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [pendingAction, setPendingAction] = useState<string | null>(null)
  const [requestNumber, setRequestNumber] = useState(0)

  const loadCycles = useCallback(async (signal?: AbortSignal) => {
    return createReviewCycleApi().list(signal)
  }, [])

  useEffect(() => {
    const abortController = new AbortController()
    void loadCycles(abortController.signal)
      .then(setCycles)
      .catch((requestError: unknown) => {
        if (!(requestError instanceof Error && requestError.name === 'AbortError')) {
          setError(requestErrorMessage())
        }
      })
      .finally(() => {
        if (!abortController.signal.aborted) {
          setLoading(false)
        }
      })
    return () => { abortController.abort() }
  }, [loadCycles, requestNumber])

  const runMutation = useCallback(async (
    actionKey: string,
    operation: () => Promise<unknown>,
  ): Promise<boolean> => {
    setPendingAction(actionKey)
    setError(null)
    try {
      await operation()
      setCycles(await loadCycles())
      return true
    } catch {
      setError(requestErrorMessage())
      return false
    } finally {
      setPendingAction(null)
    }
  }, [loadCycles])

  const create = useCallback(async (request: ReviewCycleDraft) => {
    return runMutation('create', () => createReviewCycleApi().create(request))
  }, [runMutation])

  const update = useCallback(async (id: string, request: ReviewCycleDraft) => {
    return runMutation(`update:${id}`, () => createReviewCycleApi().update(id, request))
  }, [runMutation])

  const publish = useCallback(async (id: string) => {
    await runMutation(`publish:${id}`, () => createReviewCycleApi().publish(id))
  }, [runMutation])

  const retire = useCallback(async (id: string) => {
    await runMutation(`retire:${id}`, () => createReviewCycleApi().retire(id))
  }, [runMutation])

  const provision = useCallback(async (id: string) => {
    await runMutation(`provision:${id}`, () => createReviewCycleApi().provision(id))
  }, [runMutation])

  const retry = useCallback(() => {
    setLoading(true)
    setError(null)
    setRequestNumber((value) => value + 1)
  }, [])

  return {
    cycles,
    error,
    loading,
    pendingAction,
    create,
    update,
    publish,
    retire,
    provision,
    retry,
  }
}
