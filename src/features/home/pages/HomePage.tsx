import { netBadgeLoginUrl } from '../../auth/netBadgeAuthentication'
import { useHomeController } from '../hooks/useHomeController'
import { HomeExperience } from './HomeExperience'

export function HomePage() {
  const controller = useHomeController()

  if (controller.loadState.status === 'loading') {
    return <main className="grid min-h-screen place-items-center bg-white px-6 dark:bg-[#16151b]" role="status"><p className="text-sm text-slate-600 dark:text-slate-300">Loading your workspace…</p></main>
  }

  if (controller.loadState.status === 'error') {
    return (
      <main className="grid min-h-screen place-items-center bg-white px-6 text-slate-950 dark:bg-[#16151b] dark:text-white">
        <section className="max-w-md text-center" aria-labelledby="load-error-title">
          <p className="text-sm font-semibold text-blue-700 dark:text-blue-200">Vitae.</p>
          <h1 id="load-error-title" className="mt-4 text-3xl font-semibold tracking-tight">Your workspace could not be loaded.</h1>
          <p className="mt-4 text-sm leading-6 text-slate-600 dark:text-slate-300">{controller.loadState.message}</p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <button type="button" className="primary-button" onClick={() => { controller.retry() }}>Try again</button>
            <a className="text-button" href={netBadgeLoginUrl()}>Sign in with NetBadge</a>
          </div>
        </section>
      </main>
    )
  }

  return( <HomeExperience
          data={controller.loadState.data}
          onOnboardFaculty={controller.onboardFaculty}
          onboardingSubmitting={controller.onboardingSubmitting}
          onboardingError={controller.onboardingError}
        />
  )
}
