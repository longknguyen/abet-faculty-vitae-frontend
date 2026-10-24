import { useState } from 'react'

import type { ReviewCycle } from '../model/reviewCycleSchemas'
import { useReviewCycleAdministration } from '../hooks/useReviewCycleAdministration'
import { ReviewCycleForm } from './ReviewCycleForm'

const statusStyle = {
  DRAFT: 'bg-amber-50 text-amber-800 dark:bg-amber-950 dark:text-amber-200',
  PUBLISHED: 'bg-green-50 text-green-800 dark:bg-green-950 dark:text-green-200',
  RETIRED: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300',
} as const

function statusLabel(status: ReviewCycle['status']) {
  return status === 'PUBLISHED'
    ? 'Current'
    : status.charAt(0) + status.slice(1).toLocaleLowerCase()
}

function formatPublishedDate(value: string | null) {
  return value === null
    ? 'Not published'
    : new Intl.DateTimeFormat('en-US', { dateStyle: 'medium' }).format(new Date(value))
}

export function ReviewCycleAdministration() {
  const controller = useReviewCycleAdministration()
  const [creating, setCreating] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const editingCycle = controller.cycles.find((cycle) => cycle.id === editingId)
  const formOpen = creating || editingCycle !== undefined

  function closeForm() {
    setCreating(false)
    setEditingId(null)
  }

  return (
    <section id="review-cycles" className="border-t border-[#24103e20] py-12 dark:border-[#eee1ff27]" aria-labelledby="review-cycles-title">
      <div className="flex flex-wrap items-end justify-between gap-6">
        <div>
          <p className="eyebrow">Administration</p>
          <h2 id="review-cycles-title" className="mt-2 text-3xl font-semibold tracking-tight">Review cycles</h2>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600 dark:text-slate-300">
            Prepare cycle requirements, publish the current revision, and create faculty records when the cycle is ready.
          </p>
        </div>
        {!formOpen && (
          <button
            type="button"
            className="primary-button"
            disabled={controller.pendingAction !== null}
            onClick={() => { setCreating(true) }}
          >
            New draft
          </button>
        )}
      </div>

      {formOpen && (
        <ReviewCycleForm
          key={editingCycle?.id ?? 'new-cycle'}
          cycle={editingCycle}
          submitting={controller.pendingAction === 'create' || controller.pendingAction === `update:${editingCycle?.id ?? ''}`}
          onCancel={closeForm}
          onSubmit={async (request) => {
            const saved = editingCycle === undefined
              ? await controller.create(request)
              : await controller.update(editingCycle.id, request)
            if (saved) {
              closeForm()
            }
            return saved
          }}
        />
      )}

      {controller.error !== null && (
        <div className="mt-6 flex flex-wrap items-center justify-between gap-4 border-y border-red-200 py-4 text-sm text-red-700 dark:border-red-900 dark:text-red-200" role="alert">
          <span>{controller.error}</span>
          <button type="button" className="text-button" onClick={controller.retry}>Try again</button>
        </div>
      )}

      {controller.loading ? (
        <div className="mt-8 space-y-3 motion-safe:animate-pulse" role="status">
          <span className="sr-only">Loading review cycles…</span>
          {[0, 1].map((item) => <div key={item} className="h-24 rounded-xl bg-slate-100 dark:bg-[#242229]" aria-hidden="true" />)}
        </div>
      ) : (
        <div className="mt-8 divide-y divide-[#24103e20] border-y border-[#24103e20] dark:divide-[#eee1ff27] dark:border-[#eee1ff27]">
          {controller.cycles.map((cycle) => (
            <article key={cycle.id} className="grid gap-5 py-6 lg:grid-cols-[1fr_auto] lg:items-center">
              <div>
                <div className="flex flex-wrap items-center gap-3">
                  <h3 className="text-lg font-semibold">{cycle.label}</h3>
                  <span className={`inline-flex rounded-full px-2.5 py-1 text-xs ${statusStyle[cycle.status]}`}>
                    {statusLabel(cycle.status)}
                  </span>
                </div>
                <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
                  {cycle.departmentName} · Revision {cycle.revisionNumber} · {formatPublishedDate(cycle.publishedAt)}
                </p>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                  {cycle.requiredSections.length} required sections · {cycle.provisionedFacultyCount} of {cycle.totalFacultyCount} faculty provisioned
                </p>
              </div>
              <div className="flex flex-wrap gap-x-4 gap-y-1 lg:justify-end">
                {cycle.status === 'DRAFT' && (
                  <>
                    <button
                      type="button"
                      className="text-button"
                      disabled={controller.pendingAction !== null}
                      onClick={() => { setEditingId(cycle.id) }}
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      className="text-button"
                      disabled={controller.pendingAction !== null}
                      onClick={() => {
                        if (globalThis.confirm('Publish this revision as the current review cycle? The existing current cycle will be retired.')) {
                          void controller.publish(cycle.id)
                        }
                      }}
                    >
                      {controller.pendingAction === `publish:${cycle.id}` ? 'Publishing…' : 'Publish'}
                    </button>
                  </>
                )}
                {cycle.status === 'PUBLISHED' && (
                  <>
                    <button
                      type="button"
                      className="text-button"
                      disabled={controller.pendingAction !== null}
                      onClick={() => { void controller.provision(cycle.id) }}
                    >
                      {controller.pendingAction === `provision:${cycle.id}` ? 'Provisioning…' : 'Provision faculty'}
                    </button>
                    <button
                      type="button"
                      className="text-button"
                      disabled={controller.pendingAction !== null}
                      onClick={() => {
                        if (globalThis.confirm('Retire this review cycle? Faculty records and history will be preserved.')) {
                          void controller.retire(cycle.id)
                        }
                      }}
                    >
                      {controller.pendingAction === `retire:${cycle.id}` ? 'Retiring…' : 'Retire'}
                    </button>
                  </>
                )}
              </div>
            </article>
          ))}
          {controller.cycles.length === 0 && (
            <p className="py-8 text-sm text-slate-500 dark:text-slate-300">No review cycles have been created.</p>
          )}
        </div>
      )}
    </section>
  )
}
