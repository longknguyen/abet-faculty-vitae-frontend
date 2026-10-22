function SkeletonBlock({ className }: { className: string }) {
  return (
    <div
      aria-hidden="true"
      className={`rounded-md bg-slate-200 dark:bg-[#302d36] ${className}`}
    />
  )
}

export function HomeLoadingSkeleton() {
  return (
    <main
      className="min-h-screen bg-white text-[#1c1730] dark:bg-[#16151b] dark:text-[#f9f5ff]"
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <span className="sr-only">Loading your workspace…</span>
      <div className="mx-auto w-full max-w-7xl px-5 sm:px-8 lg:px-12">
        <div className="motion-safe:animate-pulse">
          <header className="flex min-h-20 items-center justify-between gap-8 border-b border-[#24103e20] py-4 dark:border-[#eee1ff27]">
            <SkeletonBlock className="h-7 w-20" />
            <div className="hidden gap-6 sm:flex" aria-hidden="true">
              <SkeletonBlock className="h-4 w-16" />
              <SkeletonBlock className="h-4 w-16" />
            </div>
            <div className="flex items-center gap-3" aria-hidden="true">
              <SkeletonBlock className="hidden h-4 w-24 sm:block" />
              <SkeletonBlock className="size-9 rounded-full" />
            </div>
          </header>

          <section className="grid items-center gap-8 py-10 sm:py-14 lg:min-h-[29rem] lg:grid-cols-[1.1fr_1fr]" aria-hidden="true">
            <div>
              <SkeletonBlock className="h-5 w-48" />
              <div className="mt-5 space-y-3">
                <SkeletonBlock className="h-12 w-[min(24rem,85%)] sm:h-14" />
                <SkeletonBlock className="h-12 w-[min(15rem,60%)] sm:h-14" />
              </div>
              <SkeletonBlock className="mt-6 h-4 w-44" />
              <div className="mt-8 space-y-3">
                <SkeletonBlock className="h-4 w-[min(22rem,90%)]" />
                <SkeletonBlock className="h-4 w-[min(17rem,70%)]" />
              </div>
              <SkeletonBlock className="mt-6 h-11 w-28 rounded-full" />
            </div>

            <div className="grid min-h-96 place-items-center px-4 py-6">
              <div className="w-[min(17rem,80vw)] rotate-3 bg-slate-100 p-7 shadow-xl dark:bg-[#242229]">
                <SkeletonBlock className="h-3 w-28" />
                <SkeletonBlock className="mt-7 h-7 w-40" />
                <SkeletonBlock className="mt-3 h-3 w-full" />
                <div className="mt-8 space-y-3">
                  <SkeletonBlock className="h-3 w-24" />
                  <SkeletonBlock className="h-3 w-full" />
                  <SkeletonBlock className="h-3 w-5/6" />
                  <SkeletonBlock className="h-3 w-full" />
                </div>
              </div>
            </div>
          </section>

          <div className="grid gap-6 border-t border-[#24103e20] py-8 sm:grid-cols-3 dark:border-[#eee1ff27]" aria-hidden="true">
            {[0, 1, 2].map((item) => (
              <div key={item}>
                <SkeletonBlock className="h-3 w-6" />
                <SkeletonBlock className="mt-3 h-5 w-36" />
                <SkeletonBlock className="mt-3 h-4 w-48 max-w-full" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  )
}
