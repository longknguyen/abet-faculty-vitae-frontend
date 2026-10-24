import { useCallback, useEffect, useState } from 'react'

import { createReviewCycleApi } from '../api/createReviewCycleApi'
import type { ReviewCycleDraft } from '../api/ReviewCycleApi'
import type { ProvisionResult, ReviewCycle } from '../model/reviewCycleSchemas'

interface ReviewCycleAdministrationState {
  cycles: ReviewCycle[]
  error: string | null
  loading: boolean
  pendingAction: string | null
  create: (request: ReviewCycleDraft) => Promise<boolean>
  update: (id: string, request: ReviewCycleDraft) => Promise<boolean>
  publish: (id: string) => Promise<boolean>
  retire: (id: string) => Promise<boolean>
  provision: (id: string) => Promise<ProvisionResult | null>
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

  const runMutation = useCallback(async <Result,>(
    actionKey: string,
    operation: () => Promise<Result>,
  ): Promise<Result | null> => {
    setPendingAction(actionKey)
    setError(null)
    try {
      const result = await operation()
      setCycles(await loadCycles())
      return result
    } catch {
      setError(requestErrorMessage())
      return null
    } finally {
      setPendingAction(null)
    }
  }, [loadCycles])

  const create = useCallback(async (request: ReviewCycleDraft) => {
    return (await runMutation(
      'create',
      () => createReviewCycleApi().create(request),
    )) !== null
  }, [runMutation])

  const update = useCallback(async (id: string, request: ReviewCycleDraft) => {
    return (await runMutation(
      `update:${id}`,
      () => createReviewCycleApi().update(id, request),
    )) !== null
  }, [runMutation])

  const publish = useCallback(async (id: string) => {
    return (await runMutation(
      `publish:${id}`,
      () => createReviewCycleApi().publish(id),
    )) !== null
  }, [runMutation])

  const retire = useCallback(async (id: string) => {
    return (await runMutation(
      `retire:${id}`,
      () => createReviewCycleApi().retire(id),
    )) !== null
  }, [runMutation])

  const provision = useCallback(async (id: string) => {
    return runMutation(
      `provision:${id}`,
      () => createReviewCycleApi().provision(id),
    )
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
