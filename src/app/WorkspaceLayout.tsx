import { Outlet } from 'react-router-dom'

import { startNetBadgeAuthentication } from '../features/auth/netBadgeAuthentication'
import { HomeLoadingSkeleton } from '../features/home/components/HomeLoadingSkeleton'
import { HomeShell } from '../features/home/components/HomeShell'
import { VitaeOpeningState } from '../features/home/components/VitaeOpeningState'
import { useHomeController } from '../features/home/hooks/useHomeController'
import type { WorkspaceContext } from './workspaceContext'

export function WorkspaceLayout() {
  const controller = useHomeController()

  if (controller.loadState.status === 'opening') {
    return <VitaeOpeningState />
  }

  if (controller.loadState.status === 'loading') {
    return <HomeLoadingSkeleton />
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
            <button type="button" className="text-button" onClick={startNetBadgeAuthentication}>Sign in with NetBadge</button>
          </div>
        </section>
      </main>
    )
  }

  const data = controller.loadState.data

  return (
    <HomeShell displayName={data.currentUser.displayName} roles={data.currentUser.roles}>
      <Outlet context={{
        data,
        onOnboardFaculty: controller.onboardFaculty,
        onboardingSubmitting: controller.onboardingSubmitting,
        onboardingError: controller.onboardingError,
      } satisfies WorkspaceContext} />
    </HomeShell>
  )
}
