import { useState, type SyntheticEvent } from 'react'

import type { ReviewCycleDraft } from '../api/ReviewCycleApi'
import type { ReviewCycle } from '../model/reviewCycleSchemas'

interface ReviewCycleFormProps {
  cycle?: ReviewCycle
  templateSource?: ReviewCycle
  submitting: boolean
  onCancel: () => void
  onSubmit: (request: ReviewCycleDraft) => Promise<boolean>
}

const defaultTemplate = {
  renderingTemplateName: 'faculty-vitae',
} satisfies Pick<ReviewCycle, 'renderingTemplateName'>

const inputClass = 'mt-2 w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition [color-scheme:light] focus:border-blue-600 focus:ring-2 focus:ring-blue-100 dark:border-white/15 dark:bg-[#1c1a22] dark:[color-scheme:dark] dark:focus:ring-blue-950'
const textInputClass = `${inputClass} text-slate-950 placeholder:text-slate-500 dark:text-white dark:placeholder:text-slate-400`

function dateInputClass(value: string) {
  return `${inputClass} ${value === '' ? 'text-slate-500 dark:text-slate-400' : 'text-slate-950 dark:text-white'}`
}

function templateLabel(template: Pick<ReviewCycle, 'renderingTemplateName'> | typeof defaultTemplate) {
  return template.renderingTemplateName
    .split(/[-_]+/u)
    .map((word) => word.charAt(0).toLocaleUpperCase() + word.slice(1))
    .join(' ')
}

export function ReviewCycleForm({
  cycle,
  templateSource,
  submitting,
  onCancel,
  onSubmit,
}: ReviewCycleFormProps) {
  const template = cycle ?? templateSource ?? defaultTemplate
  const [label, setLabel] = useState(cycle?.label ?? '')
  const [startDate, setStartDate] = useState(cycle?.startDate ?? '')
  const [endDate, setEndDate] = useState(cycle?.endDate ?? '')
  const [submissionDeadline, setSubmissionDeadline] = useState(cycle?.submissionDeadline ?? '')
  const [formError, setFormError] = useState<string | null>(null)

  async function handleSubmit(event: SyntheticEvent<HTMLFormElement>) {
    event.preventDefault()
    setFormError(null)

    if (endDate < startDate) {
      setFormError('End date must be on or after the start date.')
      return
    }
    if (submissionDeadline !== ''
      && (submissionDeadline < startDate || submissionDeadline > endDate)) {
      setFormError('Submission deadline must fall within the review period.')
      return
    }

    const saved = await onSubmit({
      label: label.trim(),
      startDate,
      endDate,
      submissionDeadline: submissionDeadline === '' ? null : submissionDeadline,
    })
    if (!saved) {
      setFormError('The cycle could not be saved. Review the values and try again.')
    }
  }

  return (
    <form className="grid gap-6" onSubmit={(event) => { void handleSubmit(event) }}>
      <div className="grid gap-5 sm:grid-cols-2">
        <label className="text-sm font-medium sm:col-span-2">
          Cycle Name
          <input
            className={textInputClass}
            required
            maxLength={50}
            placeholder="e.g. 2027–28"
            autoComplete="off"
            value={label}
            onChange={(event) => { setLabel(event.target.value) }}
          />
        </label>

        <label className="text-sm font-medium">
          Start Date
          <input
            type="date"
            className={dateInputClass(startDate)}
            required
            value={startDate}
            onChange={(event) => { setStartDate(event.target.value) }}
          />
        </label>

        <label className="text-sm font-medium">
          End Date
          <input
            type="date"
            className={dateInputClass(endDate)}
            required
            min={startDate || undefined}
            value={endDate}
            onChange={(event) => { setEndDate(event.target.value) }}
          />
        </label>

        <label className="text-sm font-medium sm:col-span-2">
          Submission Deadline <span className="text-xs font-normal text-slate-500 dark:text-slate-300">Optional</span>
          <input
            type="date"
            className={dateInputClass(submissionDeadline)}
            min={startDate || undefined}
            max={endDate || undefined}
            value={submissionDeadline}
            onChange={(event) => { setSubmissionDeadline(event.target.value) }}
          />
          <span className="mt-2 block text-xs font-normal text-slate-500 dark:text-slate-300">The final date for faculty submissions.</span>
        </label>
      </div>

      <div className="border-y border-[#24103e20] py-4 dark:border-[#eee1ff27]">
        <span className="text-xs text-slate-500 dark:text-slate-300">ABET Template</span>
        <p className="mt-1 text-sm font-medium">{templateLabel(template)}</p>
      </div>

      {cycle === undefined && <p className="text-xs text-slate-500 dark:text-slate-300">New cycles are saved as drafts. Make one current when you are ready to use it.</p>}
      {formError !== null && <p role="alert" className="text-sm text-red-600 dark:text-red-300">{formError}</p>}

      <div className="flex flex-wrap gap-5">
        <button type="submit" className="primary-button" disabled={submitting}>
          {submitting ? 'Saving…' : cycle === undefined ? 'Save Draft' : 'Save Changes'}
        </button>
        <button type="button" className="text-button" disabled={submitting} onClick={onCancel}>Cancel</button>
      </div>
    </form>
  )
}
