import { useState, type SyntheticEvent } from 'react'

interface FacultyOnboardingProps {
  displayName: string
  surname: string | null
  submitting: boolean
  error: string | null
  onCancel: () => void
  onSubmit: (name: {
    givenName: string
    middleName?: string
    familyName: string
    suffix?: string
    displayName?: string
  }) => void
}

function inferredGivenName(displayName: string, surname: string | null): string {
  const normalisedDisplayName = displayName.trim()
  const normalisedSurname = surname?.trim()

  if (normalisedSurname !== undefined && normalisedSurname !== '') {
    const surnameStart = normalisedDisplayName.length - normalisedSurname.length
    if (
      surnameStart > 0
      && normalisedDisplayName.slice(surnameStart).toLocaleLowerCase()
        === normalisedSurname.toLocaleLowerCase()
    ) {
      const withoutSurname = normalisedDisplayName.slice(0, surnameStart).trim()
      if (withoutSurname !== '') {
        return withoutSurname
      }
    }
  }

  return normalisedDisplayName.split(/\s+/u)[0] ?? ''
}

export function FacultyOnboardingForm({
  displayName: identityDisplayName,
  surname,
  submitting,
  onCancel,
  onSubmit,
  error,
}: FacultyOnboardingProps) {
  const [givenName, setGivenName] = useState(() => inferredGivenName(identityDisplayName, surname))
  const [familyName, setFamilyName] = useState(surname ?? '')
  const [suffix, setSuffix] = useState('')
  const [middleName, setMiddleName] = useState('')
  const [displayName, setDisplayName] = useState(identityDisplayName)

  function handleSubmit(event: SyntheticEvent<HTMLFormElement>) {
    event.preventDefault()

    onSubmit({
      givenName: givenName.trim(),
      middleName: middleName.trim() || undefined,
      familyName: familyName.trim(),
      suffix: suffix.trim() || undefined,
      displayName: displayName.trim() || undefined,
    })
  }

  const inputClass = 'mt-2 w-full rounded-lg border border-[#24103e30] bg-white px-4 py-3 text-sm text-[#1c1730] outline-none transition focus:border-blue-600 focus:ring-2 focus:ring-blue-100 dark:border-[#eee1ff27] dark:bg-[#1c1a22] dark:text-[#f9f5ff] dark:focus:ring-blue-950'

  return (
    <section
      id="faculty-onboarding"
      aria-labelledby="onboarding-title"
      className="grid gap-10 py-10 sm:py-14 lg:grid-cols-[0.9fr_1.1fr]"
    >
      <div>
        <button type="button" className="text-button" onClick={onCancel}>
          Back to Overview
        </button>
        <h1
          id="onboarding-title"
          aria-label="Your faculty profile."
          className="mt-6 text-5xl font-semibold leading-[0.98] tracking-[-0.065em] sm:text-6xl"
        >
          Your faculty
          <br />
          profile.
        </h1>
        <p className="mt-5 max-w-sm text-sm leading-6 text-slate-600 dark:text-slate-300">
          Review your name as it should appear on your faculty vitae.
        </p>
      </div>

      <div className="self-start border-y border-[#24103e20] py-7 dark:border-[#eee1ff27]">
        <div className="rounded-xl bg-blue-50 px-4 py-3 text-blue-950 dark:bg-blue-950 dark:text-blue-100">
          <p className="text-sm font-semibold">Information on File</p>
          <p className="mt-1 text-xs leading-5 opacity-80">Review these details and make any changes needed for your faculty vitae.</p>
        </div>
        <p className="eyebrow mt-6">Profile Details</p>
        <h2 className="mt-2 text-xl font-semibold">Confirm Your Name</h2>

        <form className="mt-6 space-y-5" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="givenName" className="text-sm font-medium">Given Name *</label>
            <input
              id="givenName"
              name="givenName"
              autoComplete="given-name"
              required
              maxLength={100}
              value={givenName}
              onChange={(event) => { setGivenName(event.target.value) }}
              className={inputClass}
            />
          </div>

          <div>
            <label htmlFor="middleName" className="text-sm font-medium">Middle Name</label>
            <input
              id="middleName"
              name="middleName"
              autoComplete="additional-name"
              maxLength={100}
              value={middleName}
              onChange={(event) => { setMiddleName(event.target.value) }}
              className={inputClass}
            />
          </div>

          <div>
            <label htmlFor="familyName" className="text-sm font-medium">Family Name *</label>
            <input
              id="familyName"
              name="familyName"
              autoComplete="family-name"
              required
              maxLength={100}
              value={familyName}
              onChange={(event) => { setFamilyName(event.target.value) }}
              className={inputClass}
            />
          </div>

          <div>
            <label htmlFor="displayName" className="text-sm font-medium">Name Shown on Your Vitae</label>
            <input
              id="displayName"
              name="displayName"
              autoComplete="name"
              maxLength={100}
              value={displayName}
              onChange={(event) => { setDisplayName(event.target.value) }}
              className={inputClass}
            />
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-300">
              This is how your name will appear on your vitae.
            </p>
          </div>

          <div>
            <label htmlFor="suffix" className="text-sm font-medium">Suffix</label>
            <input
              id="suffix"
              name="suffix"
              maxLength={100}
              placeholder="e.g. Jr."
              value={suffix}
              onChange={(event) => { setSuffix(event.target.value) }}
              className={inputClass}
            />
          </div>

          {error !== null && (
            <p role="alert" className="text-sm text-red-600 dark:text-red-300">{error}</p>
          )}

          <div className="flex flex-wrap items-center gap-4">
            <button type="submit" disabled={submitting} className="primary-button">
              {submitting ? 'Continuing…' : 'Continue'}
            </button>
            <button type="button" className="text-button" onClick={onCancel}>Cancel</button>
          </div>
        </form>
      </div>
    </section>
  )
}
