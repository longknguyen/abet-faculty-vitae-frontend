export function VitaeOpeningState() {
  return (
    <main
      className="grid min-h-screen place-items-center bg-white px-6 text-[#1c1730] dark:bg-[#16151b] dark:text-[#f9f5ff]"
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <div className="text-center">
        <p className="text-3xl font-bold tracking-[-0.06em]">Vitae.</p>
        <span
          className="mx-auto mt-6 block size-6 rounded-full border-2 border-blue-100 border-t-blue-600 motion-safe:animate-spin dark:border-blue-950 dark:border-t-blue-300"
          aria-hidden="true"
        />
        <p className="mt-4 text-sm text-slate-600 dark:text-slate-300">Opening Vitae…</p>
      </div>
    </main>
  )
}
