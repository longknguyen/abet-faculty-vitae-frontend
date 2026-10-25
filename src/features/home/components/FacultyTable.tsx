import { useMemo, useState } from 'react'
import { Search } from 'lucide-react'

import type { FacultyCycleStatus, FacultyRecord } from '../model/homeSchemas'
import { StatusBadge } from './StatusBadge'

type FacultyFilter = 'ALL' | FacultyCycleStatus | 'NOT_STARTED'

interface FacultyTableProps {
  onSelect: (record: FacultyRecord) => void
  records: FacultyRecord[]
}

const filters: ReadonlyArray<{ label: string; value: FacultyFilter }> = [
  { label: 'All Faculty', value: 'ALL' },
  { label: 'In Review', value: 'SUBMITTED' },
  { label: 'Draft', value: 'DRAFT' },
  { label: 'Verified', value: 'VERIFIED' },
  { label: 'Not Started', value: 'NOT_STARTED' },
]

function matchesFilter(record: FacultyRecord, filter: FacultyFilter): boolean {
  return filter === 'ALL' || (filter === 'NOT_STARTED' ? record.status === null : record.status === filter)
}

function formatDate(value: string | null): string {
  return value === null ? '—' : new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short' }).format(new Date(value))
}

export function FacultyTable({ onSelect, records }: FacultyTableProps) {
  const [filter, setFilter] = useState<FacultyFilter>('ALL')
  const [search, setSearch] = useState('')
  const normalisedSearch = search.trim().toLocaleLowerCase()
  const visibleRecords = useMemo(
    () => records.filter((record) => matchesFilter(record, filter) && record.displayName.toLocaleLowerCase().includes(normalisedSearch)),
    [filter, normalisedSearch, records],
  )
  const count = (value: FacultyFilter) => records.filter((record) => matchesFilter(record, value)).length

  return (
    <>
      <div className="flex flex-wrap gap-x-6 gap-y-1 border-b border-[#24103e20] dark:border-[#eee1ff27]" role="group" aria-label="Filter Faculty by Status">
        {filters.map((option) => (
          <button key={option.value} type="button" className={`border-b-2 px-0 py-3 text-sm ${filter === option.value ? 'border-blue-600 text-blue-700 dark:border-blue-300 dark:text-blue-200' : 'border-transparent text-slate-500 dark:text-slate-300'}`} aria-pressed={filter === option.value} onClick={() => { setFilter(option.value) }}>
            {option.label} <span className="text-xs">{count(option.value)}</span>
          </button>
        ))}
      </div>
      <div className="my-6 flex flex-wrap items-center justify-between gap-4">
        <h2 className="text-2xl font-semibold tracking-tight">Faculty Records</h2>
        <label className="flex min-h-11 w-full items-center gap-2 rounded-full border border-slate-200 px-4 sm:w-auto dark:border-white/15">
          <Search aria-hidden="true" size={16} className="text-slate-400" />
          <span className="sr-only">Search Faculty</span>
          <input className="w-full bg-transparent text-base outline-none sm:w-48" type="search" placeholder="Search Faculty" value={search} onChange={(event) => { setSearch(event.target.value) }} />
        </label>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[34rem] border-collapse text-left text-sm">
          <thead><tr className="border-b border-[#24103e20] text-xs text-slate-500 dark:border-[#eee1ff27] dark:text-slate-300"><th className="py-3 pr-4 font-medium" scope="col">Faculty Member</th><th className="px-4 py-3 font-medium" scope="col">Status</th><th className="px-4 py-3 font-medium" scope="col">Updated</th><th className="py-3 pl-4 text-right font-medium" scope="col">Action</th></tr></thead>
          <tbody>
            {visibleRecords.map((record) => (
              <tr key={record.professorId} className="border-b border-[#24103e20] dark:border-[#eee1ff27]">
                <th className="py-4 pr-4 font-medium" scope="row">{record.displayName}</th>
                <td className="px-4 py-4"><StatusBadge status={record.status} /></td>
                <td className="px-4 py-4 text-slate-500 dark:text-slate-300">{formatDate(record.updatedAt)}</td>
                <td className="py-4 pl-4 text-right"><button type="button" className="text-button" onClick={() => { onSelect(record) }}>{record.status === 'SUBMITTED' ? 'Review' : 'View'}</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {visibleRecords.length === 0 && <p className="border-b border-[#24103e20] py-7 text-sm text-slate-500 dark:border-[#eee1ff27] dark:text-slate-300">No faculty match this search.</p>}
      <p className="mt-4 text-xs text-slate-500 dark:text-slate-400" aria-live="polite">Showing {visibleRecords.length} of {records.length} faculty</p>
    </>
  )
}
