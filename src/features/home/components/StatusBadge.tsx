import type { FacultyCycleStatus } from '../model/homeSchemas'

interface StatusBadgeProps {
  status: FacultyCycleStatus | null
}

const labels: Record<FacultyCycleStatus, string> = {
  DRAFT: 'Draft',
  SUBMITTED: 'In review',
  VERIFIED: 'Verified',
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const state = status ?? 'NOT_STARTED'
  const colour = {
    DRAFT: 'bg-amber-50 text-amber-800 dark:bg-amber-950 dark:text-amber-200',
    NOT_STARTED: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300',
    SUBMITTED: 'bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-200',
    VERIFIED: 'bg-green-50 text-green-800 dark:bg-green-950 dark:text-green-200',
  }[state]

  return (
    <span className={`inline-flex rounded-full px-2.5 py-1 text-xs ${colour}`}>
      {status === null ? 'Not started' : labels[status]}
    </span>
  )
}
