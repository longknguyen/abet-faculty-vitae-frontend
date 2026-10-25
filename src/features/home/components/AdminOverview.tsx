import { ArrowRight } from 'lucide-react'

import type { FacultyRecord, HomeData } from '../model/homeSchemas'
import { FacultyTable } from './FacultyTable'

interface AdminOverviewProps {
  cycle: HomeData['cycle']
  displayName: string
  onSelect: (record: FacultyRecord) => void
  records: FacultyRecord[]
}

export function AdminOverview({ cycle, displayName, onSelect, records }: AdminOverviewProps) {
  const waiting = records.filter((record) => record.status === 'SUBMITTED')
  const nextRecord = waiting.at(0)
  const givenName = displayName.split(/\s+/u)[0] ?? displayName
  const cycleSummary = cycle === null
    ? 'No active ABET review cycle'
    : `${cycle.label} · ${cycle.departmentName}`

  return (
    <section id="faculty" className="pb-12" aria-labelledby="faculty-overview-title">
      <div className="flex flex-wrap items-end justify-between gap-7 py-10 sm:py-14">
        <div><p className="text-base text-slate-500 dark:text-slate-300">Welcome back, {givenName}.</p><h1 id="faculty-overview-title" aria-label="Faculty overview." className="mt-4 text-5xl font-semibold leading-[0.98] tracking-[-0.06em] sm:text-6xl">Faculty<br />overview.</h1><p className="mt-5 text-base text-slate-500 dark:text-slate-300">{cycleSummary}</p></div>
        <div className="flex flex-wrap items-center gap-4 sm:grid sm:justify-items-end">
          <p className="text-sm text-slate-500 dark:text-slate-300">{waiting.length} awaiting review</p>
          {nextRecord === undefined ? <span className="text-sm text-slate-500 dark:text-slate-300">No vitae awaiting review</span> : <button type="button" className="primary-button" onClick={() => { onSelect(nextRecord) }}>Review Next Vitae <ArrowRight aria-hidden="true" size={17} /></button>}
        </div>
      </div>
      <FacultyTable records={records} onSelect={onSelect} />
    </section>
  )
}
