import { ArrowUpRight, Plus } from 'lucide-react'
import { useState } from 'react'

import { Modal } from '../../../shared/components/Modal'
import type { ReviewCycle, ReviewCycleSection } from '../model/reviewCycleSchemas'
import { useReviewCycleAdministration } from '../hooks/useReviewCycleAdministration'
import { ReviewCycleForm } from './ReviewCycleForm'

type Panel =
  | { kind: 'create' }
  | { kind: 'details'; cycleId: string }
  | { kind: 'edit'; cycleId: string }
  | { kind: 'publish'; cycleId: string }
  | { kind: 'retire'; cycleId: string }
  | { kind: 'template'; cycleId: string }
  | null

const sectionLabels: Record<ReviewCycleSection, string> = {
  PROFILE: 'Profile',
  EDUCATION: 'Education',
  EXPERIENCE: 'Experience',
  CREDENTIAL: 'Credentials',
  PROFESSIONAL_DEVELOPMENT: 'Professional development',
  SERVICE: 'Service',
  PUBLICATION_PRESENTATION: 'Publications and presentations',
}

const statusStyle = {
  DRAFT: 'bg-amber-50 text-amber-800 dark:bg-amber-950 dark:text-amber-200',
  PUBLISHED: 'bg-green-50 text-green-800 dark:bg-green-950 dark:text-green-200',
  RETIRED: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300',
} as const

function statusLabel(status: ReviewCycle['status']) {
  if (status === 'PUBLISHED') return 'Current'
  return status.charAt(0) + status.slice(1).toLocaleLowerCase()
}

function dateLabel(value: string | null) {
  if (value === null) return 'Not set'
  return new Intl.DateTimeFormat('en-US', { dateStyle: 'long', timeZone: 'UTC' })
    .format(new Date(`${value}T00:00:00Z`))
}

function reviewPeriod(cycle: ReviewCycle) {
  if (cycle.startDate === null || cycle.endDate === null) return 'Not set'
  return `${dateLabel(cycle.startDate)} – ${dateLabel(cycle.endDate)}`
}

function templateLabel(cycle: ReviewCycle) {
  const words = cycle.renderingTemplateName.replaceAll(/[-_]+/g, ' ')
  return words.charAt(0).toLocaleUpperCase() + words.slice(1)
}

function dialogTitle(panel: Panel, cycle: ReviewCycle | undefined) {
  if (panel?.kind === 'create') return 'New cycle'
  if (panel?.kind === 'edit') return cycle === undefined ? 'Edit cycle' : `Edit ${cycle.label}`
  if (panel?.kind === 'publish') return cycle === undefined ? 'Make current?' : `Make ${cycle.label} current?`
  if (panel?.kind === 'retire') return 'Retire current cycle?'
  if (panel?.kind === 'template') return 'ABET template'
  return cycle?.label ?? 'Review cycle'
}

export function ReviewCycleAdministration() {
  const controller = useReviewCycleAdministration()
  const [panel, setPanel] = useState<Panel>(null)
  const [notice, setNotice] = useState('')
  const currentCycle = controller.cycles.find((cycle) => cycle.status === 'PUBLISHED')
  const otherCycles = controller.cycles.filter((cycle) => cycle.id !== currentCycle?.id)
  const selectedCycle = panel !== null && 'cycleId' in panel
    ? controller.cycles.find((cycle) => cycle.id === panel.cycleId)
    : undefined
  const templateSource = currentCycle ?? controller.cycles[0]
  const actionPending = controller.pendingAction !== null

  function closePanel() {
    if (!actionPending) setPanel(null)
  }

  async function publish(cycle: ReviewCycle) {
    const saved = await controller.publish(cycle.id)
    if (saved) {
      setPanel(null)
      setNotice(`${cycle.label} is now the current cycle.`)
    }
  }

  async function retire(cycle: ReviewCycle) {
    const saved = await controller.retire(cycle.id)
    if (saved) {
      setPanel(null)
      setNotice(`${cycle.label} was retired.`)
    }
  }

  async function provision(cycle: ReviewCycle) {
    const result = await controller.provision(cycle.id)
    if (result !== null) {
      const message = result.createdCount === 0
        ? 'All faculty already have a record for this cycle.'
        : `${String(result.createdCount)} faculty ${result.createdCount === 1 ? 'record was' : 'records were'} created.`
      setNotice(message)
    }
  }

  return (
    <main className="pb-16 pt-10 sm:pb-24 sm:pt-14" aria-labelledby="review-cycles-title">
      <div className="flex flex-col items-start justify-between gap-6 pb-9 sm:flex-row sm:items-center">
        <h1 id="review-cycles-title" className="text-5xl font-semibold tracking-[-0.055em] sm:text-6xl">Review cycles.</h1>
        <button
          type="button"
          className="primary-button"
          disabled={actionPending}
          onClick={() => { setPanel({ kind: 'create' }) }}
        >
          <Plus aria-hidden="true" size={17} />
          New cycle
        </button>
      </div>

      {controller.error !== null && (
        <div className="mb-7 flex flex-wrap items-center justify-between gap-4 border-y border-red-200 py-4 text-sm text-red-700 dark:border-red-900 dark:text-red-200" role="alert">
          <span>{controller.error}</span>
          <button type="button" className="text-button" onClick={controller.retry}>Try again</button>
        </div>
      )}

      {controller.loading ? (
        <div className="space-y-8 motion-safe:animate-pulse" role="status">
          <span className="sr-only">Loading review cycles…</span>
          <div className="h-72 border-y border-[#24103e20] bg-slate-50 dark:border-[#eee1ff27] dark:bg-[#1c1a22]" aria-hidden="true" />
          <div className="space-y-3" aria-hidden="true">
            <div className="h-8 w-40 rounded bg-slate-100 dark:bg-[#242229]" />
            <div className="h-20 rounded bg-slate-100 dark:bg-[#242229]" />
            <div className="h-20 rounded bg-slate-100 dark:bg-[#242229]" />
          </div>
        </div>
      ) : (
        <>
          {currentCycle === undefined ? (
            <section className="border-y border-[#24103e20] py-9 dark:border-[#eee1ff27]" aria-labelledby="current-cycle-title">
              <p className="eyebrow">Current cycle</p>
              <h2 id="current-cycle-title" className="mt-4 text-3xl font-semibold tracking-tight">No current cycle</h2>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600 dark:text-slate-300">
                Create a draft or make an existing draft current when it is ready.
              </p>
            </section>
          ) : (
            <section className="border-y border-[#24103e20] py-7 dark:border-[#eee1ff27]" aria-labelledby="current-cycle-title">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <p className="eyebrow">Current cycle</p>
                <span className={`inline-flex rounded-full px-3 py-1 text-xs ${statusStyle.PUBLISHED}`}>Current</span>
              </div>
              <div className="mt-3 flex flex-wrap items-center justify-between gap-5">
                <h2 id="current-cycle-title" className="text-4xl font-semibold tracking-[-0.045em] sm:text-5xl">{currentCycle.label}</h2>
                <button type="button" className="text-button" onClick={() => { setPanel({ kind: 'template', cycleId: currentCycle.id }) }}>
                  View template
                  <ArrowUpRight aria-hidden="true" size={16} />
                </button>
              </div>
              <dl className="mt-8 grid gap-6 pb-7 sm:grid-cols-3">
                <div>
                  <dt className="text-xs text-slate-500 dark:text-slate-300">Review period</dt>
                  <dd className="mt-2 text-sm leading-6">{reviewPeriod(currentCycle)}</dd>
                </div>
                <div>
                  <dt className="text-xs text-slate-500 dark:text-slate-300">Submission deadline</dt>
                  <dd className="mt-2 text-sm leading-6">{dateLabel(currentCycle.submissionDeadline)}</dd>
                </div>
                <div>
                  <dt className="text-xs text-slate-500 dark:text-slate-300">ABET template</dt>
                  <dd className="mt-2 text-sm leading-6">{templateLabel(currentCycle)}</dd>
                </div>
              </dl>
              <div className="flex flex-wrap items-center justify-between gap-5 border-t border-[#24103e20] pt-3 dark:border-[#eee1ff27]">
                <p className="text-xs text-slate-500 dark:text-slate-300">Revision {currentCycle.revisionNumber} · {currentCycle.renderingTemplateName}</p>
                <div className="flex flex-wrap gap-5">
                  <button
                    type="button"
                    className="text-button"
                    disabled={actionPending}
                    onClick={() => { void provision(currentCycle) }}
                  >
                    {controller.pendingAction === `provision:${currentCycle.id}` ? 'Provisioning…' : 'Provision faculty'}
                  </button>
                  <button
                    type="button"
                    className="text-button"
                    disabled={actionPending}
                    onClick={() => { setPanel({ kind: 'retire', cycleId: currentCycle.id }) }}
                  >
                    Retire cycle
                  </button>
                </div>
              </div>
            </section>
          )}

          <section className="pt-9" aria-labelledby="other-cycles-title">
            <h2 id="other-cycles-title" className="text-2xl font-semibold tracking-tight">Other cycles</h2>
            {otherCycles.length === 0 ? (
              <p className="mt-5 border-b border-[#24103e20] py-6 text-sm text-slate-500 dark:border-[#eee1ff27] dark:text-slate-300">No other review cycles.</p>
            ) : (
              <table className="mt-5 w-full text-left text-sm">
                <thead className="hidden text-xs font-normal text-slate-500 sm:table-header-group dark:text-slate-300">
                  <tr>
                    <th scope="col" className="border-b border-[#24103e20] pb-3 pr-4 font-normal dark:border-[#eee1ff27]">Cycle</th>
                    <th scope="col" className="border-b border-[#24103e20] pb-3 pr-4 font-normal dark:border-[#eee1ff27]">Review period</th>
                    <th scope="col" className="border-b border-[#24103e20] pb-3 pr-4 font-normal dark:border-[#eee1ff27]">Status</th>
                    <th scope="col" className="border-b border-[#24103e20] pb-3 text-right font-normal dark:border-[#eee1ff27]">Action</th>
                  </tr>
                </thead>
                <tbody className="block sm:table-row-group">
                  {otherCycles.map((cycle) => (
                    <tr key={cycle.id} className="grid grid-cols-[minmax(0,1fr)_auto] gap-x-4 gap-y-2 border-b border-[#24103e20] py-5 sm:table-row dark:border-[#eee1ff27]">
                      <td className="block font-semibold sm:table-cell sm:py-5 sm:pr-4">{cycle.label}</td>
                      <td className="col-start-1 row-start-2 block text-xs text-slate-500 sm:table-cell sm:py-5 sm:pr-4 dark:text-slate-300">{reviewPeriod(cycle)}</td>
                      <td className="col-start-2 row-start-1 block text-right sm:table-cell sm:py-5 sm:pr-4 sm:text-left">
                        <span className={`inline-flex rounded-full px-2.5 py-1 text-xs ${statusStyle[cycle.status]}`}>{statusLabel(cycle.status)}</span>
                      </td>
                      <td className="col-start-2 row-start-2 block text-right sm:table-cell sm:py-5">
                        <button
                          type="button"
                          className="text-button min-h-0 p-0"
                          aria-label={`${cycle.status === 'DRAFT' ? 'Manage' : 'View'} ${cycle.label}`}
                          disabled={actionPending}
                          onClick={() => { setPanel({ kind: 'details', cycleId: cycle.id }) }}
                        >
                          {cycle.status === 'DRAFT' ? 'Manage' : 'View'}
                          <ArrowUpRight aria-hidden="true" size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </section>
        </>
      )}

      <p className="min-h-8 pt-5 text-xs text-slate-500 dark:text-slate-300" role="status" aria-live="polite">{notice}</p>

      <Modal open={panel !== null} title={dialogTitle(panel, selectedCycle)} onClose={closePanel}>
        {panel?.kind === 'create' && (
          <ReviewCycleForm
            key="create-cycle"
            templateSource={templateSource}
            submitting={controller.pendingAction === 'create'}
            onCancel={closePanel}
            onSubmit={async (request) => {
              const saved = await controller.create(request)
              if (saved) {
                setPanel(null)
                setNotice(`${request.label} was saved as a draft.`)
              }
              return saved
            }}
          />
        )}

        {panel?.kind === 'edit' && selectedCycle !== undefined && (
          <ReviewCycleForm
            key={selectedCycle.id}
            cycle={selectedCycle}
            submitting={controller.pendingAction === `update:${selectedCycle.id}`}
            onCancel={closePanel}
            onSubmit={async (request) => {
              const saved = await controller.update(selectedCycle.id, request)
              if (saved) {
                setPanel(null)
                setNotice(`${request.label} was updated.`)
              }
              return saved
            }}
          />
        )}

        {panel?.kind === 'details' && selectedCycle !== undefined && (
          <div>
            <span className={`inline-flex rounded-full px-2.5 py-1 text-xs ${statusStyle[selectedCycle.status]}`}>{statusLabel(selectedCycle.status)}</span>
            <dl className="mt-6 grid gap-5">
              <div>
                <dt className="text-xs text-slate-500 dark:text-slate-300">Review period</dt>
                <dd className="mt-1 text-sm">{reviewPeriod(selectedCycle)}</dd>
              </div>
              <div>
                <dt className="text-xs text-slate-500 dark:text-slate-300">Submission deadline</dt>
                <dd className="mt-1 text-sm">{dateLabel(selectedCycle.submissionDeadline)}</dd>
              </div>
              <div>
                <dt className="text-xs text-slate-500 dark:text-slate-300">ABET template</dt>
                <dd className="mt-1 text-sm">{templateLabel(selectedCycle)} · {selectedCycle.requiredSections.length} required sections</dd>
              </div>
              <div>
                <dt className="text-xs text-slate-500 dark:text-slate-300">Faculty records</dt>
                <dd className="mt-1 text-sm">{selectedCycle.provisionedFacultyCount} faculty records</dd>
              </div>
            </dl>
            <p className="mt-6 text-xs leading-5 text-slate-500 dark:text-slate-300">
              {selectedCycle.status === 'DRAFT'
                ? 'This draft is not used for faculty records until it is made current.'
                : 'This cycle remains available for historical faculty records.'}
            </p>
            <div className="mt-7 flex flex-wrap gap-5">
              {selectedCycle.status === 'DRAFT' && (
                <>
                  <button type="button" className="primary-button" onClick={() => { setPanel({ kind: 'publish', cycleId: selectedCycle.id }) }}>Make current</button>
                  <button type="button" className="text-button" onClick={() => { setPanel({ kind: 'edit', cycleId: selectedCycle.id }) }}>Edit cycle</button>
                </>
              )}
              <button type="button" className="text-button" onClick={() => { setPanel({ kind: 'template', cycleId: selectedCycle.id }) }}>View template</button>
              <button type="button" className="text-button" onClick={closePanel}>Done</button>
            </div>
          </div>
        )}

        {panel?.kind === 'publish' && selectedCycle !== undefined && (
          <div>
            <p className="text-sm leading-7 text-slate-600 dark:text-slate-300">
              {currentCycle === undefined
                ? `${selectedCycle.label} will become the current cycle.`
                : `${currentCycle.label} will be retired and ${selectedCycle.label} will become current.`}{' '}
              Existing faculty records will stay with their original cycle.
            </p>
            <div className="mt-7 flex flex-wrap gap-5">
              <button type="button" className="primary-button" disabled={actionPending} onClick={() => { void publish(selectedCycle) }}>
                {controller.pendingAction === `publish:${selectedCycle.id}` ? 'Making current…' : 'Make current'}
              </button>
              <button type="button" className="text-button" disabled={actionPending} onClick={closePanel}>Cancel</button>
            </div>
          </div>
        )}

        {panel?.kind === 'retire' && selectedCycle !== undefined && (
          <div>
            <p className="text-sm leading-7 text-slate-600 dark:text-slate-300">
              {selectedCycle.label} will no longer be the current cycle. Existing faculty records and review history will be preserved.
            </p>
            <div className="mt-7 flex flex-wrap gap-5">
              <button type="button" className="primary-button" disabled={actionPending} onClick={() => { void retire(selectedCycle) }}>
                {controller.pendingAction === `retire:${selectedCycle.id}` ? 'Retiring…' : 'Retire cycle'}
              </button>
              <button type="button" className="text-button" disabled={actionPending} onClick={closePanel}>Cancel</button>
            </div>
          </div>
        )}

        {panel?.kind === 'template' && selectedCycle !== undefined && (
          <div>
            <p className="text-sm text-slate-600 dark:text-slate-300">{templateLabel(selectedCycle)}</p>
            <ol className="mt-5 list-decimal space-y-3 pl-5 text-sm">
              {selectedCycle.requiredSections.map((section) => <li key={section}>{sectionLabels[section]}</li>)}
            </ol>
            <button type="button" className="primary-button mt-7" onClick={closePanel}>Done</button>
          </div>
        )}
      </Modal>
    </main>
  )
}
