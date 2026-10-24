import { useWorkspace } from '../../../app/workspaceContext'
import { ReviewCycleAdministration } from '../components/ReviewCycleAdministration'

export function ReviewCyclesPage() {
  const { data } = useWorkspace()

  if (!data.currentUser.roles.includes('ADMIN')) {
    return (
      <main className="py-16 sm:py-24" aria-labelledby="review-cycles-access-title">
        <p className="eyebrow">Administration</p>
        <h1 id="review-cycles-access-title" className="mt-3 text-4xl font-semibold tracking-[-0.04em] sm:text-6xl">Administrator access required.</h1>
        <p className="mt-5 max-w-xl text-sm leading-6 text-slate-600 dark:text-slate-300">
          Review cycles can only be managed by an administrator.
        </p>
      </main>
    )
  }

  return <ReviewCycleAdministration />
}
