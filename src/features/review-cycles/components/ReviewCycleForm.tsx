import { useState, type SyntheticEvent } from 'react'

import type { ReviewCycleDraft } from '../api/ReviewCycleApi'
import type { ReviewCycle, ReviewCycleSection } from '../model/reviewCycleSchemas'

const sectionOptions: Array<{ value: ReviewCycleSection; label: string }> = [
  { value: 'PROFILE', label: 'Profile' },
  { value: 'EDUCATION', label: 'Education' },
  { value: 'EXPERIENCE', label: 'Experience' },
  { value: 'CREDENTIAL', label: 'Credentials' },
  { value: 'PROFESSIONAL_DEVELOPMENT', label: 'Professional development' },
  { value: 'SERVICE', label: 'Service' },
  { value: 'PUBLICATION_PRESENTATION', label: 'Publications and presentations' },
]

interface ReviewCycleFormProps {
  cycle?: ReviewCycle
  submitting: boolean
  onCancel: () => void
  onSubmit: (request: ReviewCycleDraft) => Promise<boolean>
}

const inputClass = 'mt-2 w-full rounded-lg border border-[#24103e30] bg-white px-4 py-3 text-sm text-[#1c1730] outline-none transition focus:border-blue-600 focus:ring-2 focus:ring-blue-100 dark:border-[#eee1ff27] dark:bg-[#1c1a22] dark:text-[#f9f5ff] dark:focus:ring-blue-950'

export function ReviewCycleForm({
  cycle,
  submitting,
  onCancel,
  onSubmit,
}: ReviewCycleFormProps) {
  const [label, setLabel] = useState(cycle?.label ?? '')
  const [departmentName, setDepartmentName] = useState(cycle?.departmentName ?? '')
  const [renderingTemplateName, setRenderingTemplateName] = useState(
    cycle?.renderingTemplateName ?? 'faculty-vitae',
  )
  const [requiredSections, setRequiredSections] = useState<ReviewCycleSection[]>(
    cycle?.requiredSections ?? sectionOptions.map((section) => section.value),
  )
  const [formattingRules, setFormattingRules] = useState(
    JSON.stringify(cycle?.formattingRules ?? {}, null, 2),
  )
  const [formError, setFormError] = useState<string | null>(null)

  function toggleSection(section: ReviewCycleSection) {
    setRequiredSections((current) => current.includes(section)
      ? current.filter((value) => value !== section)
      : [...current, section])
  }

  async function handleSubmit(event: SyntheticEvent<HTMLFormElement>) {
    event.preventDefault()
    setFormError(null)
    if (requiredSections.length === 0) {
      setFormError('Select at least one required section.')
      return
    }

    let parsedRules: unknown
    try {
      parsedRules = JSON.parse(formattingRules) as unknown
    } catch {
      setFormError('Formatting rules must contain valid JSON.')
      return
    }
    if (parsedRules === null || Array.isArray(parsedRules) || typeof parsedRules !== 'object') {
      setFormError('Formatting rules must be a JSON object.')
      return
    }

    const saved = await onSubmit({
      label: label.trim(),
      departmentName: departmentName.trim(),
      renderingTemplateName: renderingTemplateName.trim(),
      requiredSections,
      formattingRules: parsedRules as Record<string, unknown>,
    })
    if (!saved) {
      setFormError('The draft could not be saved. Review the values and try again.')
    }
  }

  return (
    <form className="mt-6 grid gap-5 border-y border-[#24103e20] py-6 dark:border-[#eee1ff27]" onSubmit={(event) => { void handleSubmit(event) }}>
      <div className="grid gap-5 sm:grid-cols-2">
        <label className="text-sm font-medium">
          Cycle label
          <input className={inputClass} required maxLength={50} value={label} onChange={(event) => { setLabel(event.target.value) }} />
        </label>
        <label className="text-sm font-medium">
          Department
          <input className={inputClass} required maxLength={200} value={departmentName} onChange={(event) => { setDepartmentName(event.target.value) }} />
        </label>
      </div>

      <label className="text-sm font-medium">
        Rendering template
        <input className={inputClass} required maxLength={200} value={renderingTemplateName} onChange={(event) => { setRenderingTemplateName(event.target.value) }} />
      </label>

      <fieldset>
        <legend className="text-sm font-medium">Required sections</legend>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          {sectionOptions.map((section) => (
            <label key={section.value} className="flex items-center gap-3 text-sm text-slate-700 dark:text-slate-200">
              <input
                type="checkbox"
                checked={requiredSections.includes(section.value)}
                onChange={() => { toggleSection(section.value) }}
              />
              {section.label}
            </label>
          ))}
        </div>
      </fieldset>

      <div>
        <label htmlFor="formatting-rules" className="text-sm font-medium">
          Formatting rules
        </label>
        <textarea
          id="formatting-rules"
          aria-describedby="formatting-rules-description"
          className={`${inputClass} min-h-36 font-mono`}
          spellCheck="false"
          value={formattingRules}
          onChange={(event) => { setFormattingRules(event.target.value) }}
        />
        <p id="formatting-rules-description" className="mt-2 text-xs font-normal text-slate-500 dark:text-slate-300">
          Enter a JSON object containing the rules used by the document renderer.
        </p>
      </div>

      {formError !== null && <p role="alert" className="text-sm text-red-600 dark:text-red-300">{formError}</p>}

      <div className="flex flex-wrap gap-4">
        <button type="submit" className="primary-button" disabled={submitting}>
          {submitting ? 'Saving…' : cycle === undefined ? 'Create draft' : 'Save changes'}
        </button>
        <button type="button" className="text-button" disabled={submitting} onClick={onCancel}>Cancel</button>
      </div>
    </form>
  )
}
