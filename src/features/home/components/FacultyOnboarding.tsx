import { useState, type SyntheticEvent } from 'react'
import { ArrowRight } from 'lucide-react'

interface FacultyOnboardingProps {
    submitting: boolean
    error: string | null
    onSubmit: (name: {
        givenName: string
        middleName?: string
        familyName: string
        suffix?: string
        displayName?: string
    }) => void
}

export function FacultyOnboardingForm({
                                          submitting,
                                          onSubmit,
                                          error,
                                      }: FacultyOnboardingProps) {
    const [givenName, setGivenName] = useState('')
    const [familyName, setFamilyName] = useState('')
    const [suffix, setSuffix] = useState('')
    const [middleName, setMiddleName] = useState('')
    const [displayName, setDisplayName] = useState('')

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
                <p className="text-base text-slate-500 dark:text-slate-300">
                    Welcome to Vitae.
                </p>
                <h1
                    id="onboarding-title"
                    className="mt-4 text-5xl font-semibold leading-[0.98] tracking-[-0.065em] sm:text-6xl"
                >
                    Your faculty
                    <br />
                    profile.
                </h1>
                <p className="mt-5 max-w-sm text-sm leading-6 text-slate-600 dark:text-slate-300">
                    Set up your profile to get started with your ABET faculty vitae.
                    If a faculty record already exists for your account, we’ll link it
                    instead of creating a duplicate.
                </p>
            </div>

            <div className="self-start border-y border-[#24103e20] py-7 dark:border-[#eee1ff27]">
                <p className="eyebrow">Profile details</p>
                <h2 className="mt-2 text-xl font-semibold">
                    Tell us your name
                </h2>
                <p className="mt-2 text-sm text-slate-500 dark:text-slate-300">
                    Required fields are marked with an asterisk.
                </p>

                <form className="mt-6 space-y-5" onSubmit={handleSubmit}>
                    <div>
                        <label htmlFor="givenName" className="text-sm font-medium">
                            Given name *
                        </label>
                        <input
                            id="givenName"
                            name="givenName"
                            autoComplete="given-name"
                            required
                            maxLength={100}
                            value={givenName}
                            onChange={(event) => {
                            setGivenName(event.target.value)
                            }}
                             className={inputClass}
                        />
                    </div>

                    <div>
                        <label htmlFor="middleName" className="text-sm font-medium">
                            Middle name
                        </label>
                        <input
                            id="middleName"
                            name="middleName"
                            autoComplete="additional-name"
                            maxLength={100}
                            value={middleName}
                            onChange={(event) => {
                                setMiddleName(event.target.value)
                            }}
                            className={inputClass}
                        />
                    </div>

                    <div>
                        <label htmlFor="familyName" className="text-sm font-medium">
                            Family name *
                        </label>
                        <input
                            id="familyName"
                            name="familyName"
                            autoComplete="family-name"
                            required
                            maxLength={100}
                            value={familyName}
                            onChange={(event) => {setFamilyName(event.target.value)}}
                            className={inputClass}
                        />
                    </div>

                    <div>
                        <label htmlFor="displayName" className="text-sm font-medium">
                            Display name
                        </label>
                        <input
                            id="displayName"
                            name="displayName"
                            autoComplete="name"
                            maxLength={100}
                            placeholder="e.g. Dr. Alexandra Morgan"
                            value={displayName}
                            onChange={(event) => {setDisplayName(event.target.value)}}
                            className={inputClass}
                        />
                        <p className="mt-1 text-xs text-slate-500 dark:text-slate-300">
                            Optional. This is how your name will appear on your faculty profile.
                        </p>
                    </div>

                    <div>
                        <label htmlFor="suffix" className="text-sm font-medium">
                            Suffix
                        </label>
                        <input
                            id="suffix"
                            name="suffix"
                            maxLength={100}
                            placeholder="e.g. Jr"
                            value={suffix}
                            onChange={(event) => {setSuffix(event.target.value)}}
                            className={inputClass}
                        />
                    </div>

                    {error && (
                        <p role="alert" className="text-sm text-red-600 dark:text-red-300">
                            {error}
                        </p>
                    )}

                    <button
                        type="submit"
                        disabled={submitting}
                        className="primary-button"
                    >
                        {submitting ? 'Saving profile' : 'Continue'}
                        {!submitting && <ArrowRight aria-hidden="true" size={17} />}
                    </button>
                </form>
            </div>
        </section>
    )
}
