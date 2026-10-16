import { FilePlus2 } from 'lucide-react'

import type { HomeData } from '../model/homeSchemas'

type PersonalVitae = NonNullable<HomeData['personalVitae']>

interface DocumentPreviewProps {
  cycleLabel: string
  displayName: string
  previewSections: PersonalVitae['previewSections']
}

export function DocumentPreview({ cycleLabel, displayName, previewSections }: DocumentPreviewProps) {
  const isEmpty = previewSections.length === 0

  return (
    <article className="vitae-document" aria-label="Faculty vitae preview">
      <p className="vitae-document__university">UNIVERSITY OF VIRGINIA</p>
      <p className="vitae-document__name">{displayName}</p>
      <p className="vitae-document__subtitle">Computer Science · Faculty vitae · {cycleLabel}</p>
      {isEmpty ? (
        <div className="grid flex-1 place-content-center justify-items-center gap-3 py-10 text-center text-[#736977]">
          <FilePlus2 aria-hidden="true" size={28} strokeWidth={1.4} />
          <strong className="font-sans text-sm font-medium text-[#29252d]">No CV imported</strong>
          <p className="max-w-44 font-sans text-xs leading-5">Your vitae preview will appear here.</p>
        </div>
      ) : (
        previewSections.map((section) => (
          <section key={section.heading}>
            <h3 className="vitae-document__section">{section.heading}</h3>
            {section.lines.map((line) => <p key={line}>{line}</p>)}
          </section>
        ))
      )}
    </article>
  )
}
