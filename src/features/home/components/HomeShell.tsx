import type { ReactNode } from 'react'

import type { RoleName } from '../model/homeSchemas'

interface HomeShellProps {
  children: ReactNode
  displayName: string
  roles: RoleName[]
}

function initials(displayName: string): string {
  return displayName
    .split(/\s+/u)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0).toLocaleUpperCase())
    .join('')
}

export function HomeShell({ children, displayName, roles }: HomeShellProps) {
  const isFaculty = roles.includes('FACULTY')
  const isAdmin = roles.includes('ADMIN')

  return (
    <div className="min-h-screen bg-white text-[#1c1730] dark:bg-[#16151b] dark:text-[#f9f5ff]">
      <div className="mx-auto w-full max-w-7xl px-5 sm:px-8 lg:px-12">
        <header className="flex min-h-20 flex-wrap items-center justify-between gap-x-8 gap-y-3 border-b border-[#24103e20] py-4 dark:border-[#eee1ff27]">
          <a href="#overview" className="text-2xl font-bold tracking-[-0.06em]">Vitae.</a>
          <nav className="order-3 flex w-full flex-wrap items-center gap-6 text-sm text-slate-500 sm:order-none sm:w-auto dark:text-slate-300" aria-label="Primary navigation">
            <a className="font-semibold text-slate-950 dark:text-white" href="#overview">Overview</a>
            {isFaculty && <a href="#my-vitae">My vitae</a>}
            {isAdmin && <a href="#faculty">Faculty</a>}
            {isAdmin && <a href="#review-cycles">Review cycles</a>}
          </nav>
          <div className="flex items-center gap-3 text-sm">
            <span className="hidden sm:inline">{displayName}</span>
            <span className="grid size-9 place-items-center rounded-full bg-blue-50 text-xs font-semibold text-blue-700 dark:bg-blue-950 dark:text-blue-200" aria-hidden="true">
              {initials(displayName)}
            </span>
          </div>
        </header>
        {children}
      </div>
    </div>
  )
}
