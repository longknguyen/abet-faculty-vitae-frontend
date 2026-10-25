import { ArrowRight, ArrowUpRight, FileText } from 'lucide-react'

import type { HomeData } from '../model/homeSchemas'
import { DocumentPreview } from './DocumentPreview'

interface PersonalVitaeSectionProps {
  cycle: HomeData['cycle']
  displayName: string
  onboardingNeeded: boolean
  onStartImport: () => void
  personalVitae: HomeData['personalVitae']
  surname: string | null
}

export function PersonalVitaeSection({
  cycle,
  displayName,
  onboardingNeeded,
  onStartImport,
  personalVitae,
  surname,
}: PersonalVitaeSectionProps) {
  const importedVitae = personalVitae !== null && personalVitae.sourceCv !== null
    ? { ...personalVitae, sourceCv: personalVitae.sourceCv }
    : undefined
  const hasImportedCv = importedVitae !== undefined
  const previewSections = personalVitae?.previewSections ?? []
  const greetingName = surname ?? displayName
  const cycleLabel = cycle?.label ?? 'No active review cycle'
  const cycleSummary = cycle === null
    ? cycleLabel
    : `${cycle.label} · ${cycle.departmentName}`

  return (
    <section id="my-vitae" aria-labelledby="personal-vitae-title">
      <div className="grid items-center gap-8 py-10 sm:py-14 lg:min-h-[29rem] lg:grid-cols-[1.1fr_1fr]">
        <div>
          <p className="text-base text-slate-500 dark:text-slate-300">
            {hasImportedCv ? 'Welcome back' : 'Welcome'}, Professor {greetingName}.
          </p>
          <h1 id="personal-vitae-title" aria-label="Your faculty vitae." className="mt-4 text-5xl font-semibold leading-[0.98] tracking-[-0.065em] sm:text-6xl lg:text-7xl">
            Your faculty<br />vitae.
          </h1>
          <p className="mt-5 text-base text-slate-500 dark:text-slate-300">{cycleSummary}</p>
          {hasImportedCv ? (
            <div className="mt-7 flex flex-wrap items-center gap-4">
              <button type="button" className="primary-button">Continue Reviewing <ArrowRight aria-hidden="true" size={17} /></button>
              <button type="button" className="text-button">Preview Vitae <ArrowUpRight aria-hidden="true" size={16} /></button>
            </div>
          ) : (
            <>
              <p className="mt-7 max-w-sm text-sm leading-6 text-slate-600 dark:text-slate-300">
                {onboardingNeeded
                  ? 'Import your current CV to begin creating your ABET faculty vitae.'
                  : 'CV importing is not available yet.'}
              </p>
              <button
                type="button"
                className="primary-button mt-5"
                disabled={!onboardingNeeded}
                onClick={onboardingNeeded ? onStartImport : undefined}
                title={onboardingNeeded ? undefined : 'CV importing is not available yet'}
              >
                Import CV
              </button>
              {!onboardingNeeded && (
                <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">PDF or Word document</p>
              )}
            </>
          )}
        </div>
        <div className="relative grid min-h-96 place-items-center px-4 py-6">
          <div className="w-[min(17rem,80vw)] rotate-6">
            <DocumentPreview cycleLabel={cycleLabel} displayName={displayName} previewSections={previewSections} />
          </div>
          {importedVitae !== undefined && (
            <span className="absolute bottom-6 left-0 rounded-2xl bg-white px-4 py-3 text-xs shadow-lg dark:bg-[#29262f]">
              {cycleLabel} vitae · {importedVitae.status === 'SUBMITTED' ? 'In review' : importedVitae.status.toLocaleLowerCase()}
            </span>
          )}
        </div>
      </div>
      {importedVitae !== undefined ? (
        <div className="grid gap-6 border-y border-[#24103e20] py-6 md:grid-cols-2 dark:border-[#eee1ff27]">
          <div>
            <p className="eyebrow">Your Next Step</p>
            {importedVitae.nextReviewItem === null ? (
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">No unresolved review items.</p>
            ) : (
              <>
                <h2 className="mt-2 text-lg font-semibold">{importedVitae.nextReviewItem.title}</h2>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-300">{importedVitae.nextReviewItem.detail}</p>
              </>
            )}
          </div>
          <div className="border-t border-[#24103e20] pt-6 md:border-l md:border-t-0 md:pl-7 md:pt-0 dark:border-[#eee1ff27]">
            <div className="flex items-center gap-3">
              <span className="grid size-11 shrink-0 place-items-center rounded-lg bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-200"><FileText aria-hidden="true" size={19} /></span>
              <div className="min-w-0">
                <p className="truncate text-sm">{importedVitae.sourceCv.originalFilename}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">Source CV · Imported</p>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <ol className="grid gap-6 border-t border-[#24103e20] py-8 sm:grid-cols-3 dark:border-[#eee1ff27]" aria-label="Creating Your Vitae">
          {[
            ['01', 'Import Your CV', 'Add your existing document.'],
            ['02', 'Review Your Information', 'Check the details and choose what to include.'],
            ['03', 'Generate Your Vitae', 'Create your ABET-formatted document.'],
          ].map(([number, title, description]) => (
            <li key={number}>
              <span className="text-xs text-slate-400">{number}</span>
              <h2 className="mt-2 font-semibold">{title}</h2>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-300">{description}</p>
            </li>
          ))}
        </ol>
      )}
    </section>
  )
}
