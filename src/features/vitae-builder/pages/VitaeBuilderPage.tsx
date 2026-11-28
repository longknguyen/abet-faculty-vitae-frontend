import { useState, type SyntheticEvent, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import {
    Award,
    BookOpen,
    BriefcaseBusiness,
    FileText,
    GraduationCap,
    GripVertical,
    Pencil,
    Plus,
    Trash2,
    Users,
    UserRound,
} from 'lucide-react'

import { createInitialVitaeData } from '../model/initialVitaeData'
import type {
    ContributionEntry,
    CredentialEntry,
    EducationEntry,
    ExperienceEntry,
    ProfessionalDevelopmentEntry,
    VitaeData,
} from '../model/vitaeTypes'

type BaseEntry = { id: string; displayOrder: number }
type DraftValue = string | number | boolean
type FieldType = 'text' | 'date' | 'textarea' | 'select' | 'checkbox'

type FieldConfig<T> = {
    key: keyof T
    label: string
    type?: FieldType
    placeholder?: string
    required?: boolean
    maxLength?: number
    options?: { label: string; value: string }[]
}

type EditableEntryListProps<T extends BaseEntry> = {
    entries: T[]
    fields: FieldConfig<T>[]
    createEmpty: () => Omit<T, 'id' | 'displayOrder'>
    onChange: (entries: T[]) => void
    getTitle: (entry: T) => string
    getSubtitle?: (entry: T) => string
    addLabel: string
    formTitle: string
}

function makeId() {
    return crypto.randomUUID()
}

function EditableEntryList<T extends BaseEntry>({
                                                    entries,
                                                    fields,
                                                    createEmpty,
                                                    onChange,
                                                    getTitle,
                                                    getSubtitle,
                                                    addLabel,
                                                    formTitle,
                                                }: EditableEntryListProps<T>) {
    const [draft, setDraft] = useState<Record<string, DraftValue>>({})
    const [editingId, setEditingId] = useState<string | null>(null)
    const [isOpen, setIsOpen] = useState(false)
    const [draggedId, setDraggedId] = useState<string | null>(null)
    const [formError, setFormError] = useState('')

    function openAdd() {
        setFormError('')
        setDraft(Object.fromEntries(Object.entries(createEmpty())))
        setEditingId(null)
        setIsOpen(true)
    }

    function openEdit(entry: T) {
        setFormError('')
        setDraft({ ...entry })
        setEditingId(entry.id)
        setIsOpen(true)
    }

    function cancel() {
        setDraft({})
        setEditingId(null)
        setFormError('')
        setIsOpen(false)
    }

    function save(event: SyntheticEvent<HTMLFormElement>) {
        event.preventDefault()

        const requiredMissing = fields.some((field) => {
            if (field.required === false || field.type === 'checkbox') {
                return false
            }

            return !String(draft[String(field.key)] ?? '').trim()
        })

        if (requiredMissing) {
            setFormError('Complete all required fields before saving.')
            return
        }

        const startYear = String(draft.startYear ?? '').trim()
        const endYear = String(draft.endYear ?? '').trim()
        const graduationYear = String(draft.graduationYear ?? '').trim()
        const startDate = String(draft.startDate ?? '').trim()
        const endDate = String(draft.endDate ?? '').trim()
        const issueDate = String(draft.issueDate ?? '').trim()
        const expirationDate = String(draft.expirationDate ?? '').trim()
        const isCurrent = Boolean(draft.isCurrent)
        const yearPattern = /^\d{4}$/

        if (graduationYear && !yearPattern.test(graduationYear)) {
            setFormError('Graduation year must use four digits (YYYY).')
            return
        }

        if (startYear && !yearPattern.test(startYear)) {
            setFormError('Start year must use four digits (YYYY).')
            return
        }

        if (endYear && !yearPattern.test(endYear)) {
            setFormError('End year must use four digits (YYYY).')
            return
        }

        if (startYear && endYear && !isCurrent && Number(endYear) < Number(startYear)) {
            setFormError('End year cannot be earlier than start year.')
            return
        }

        if (isCurrent && endYear) {
            setFormError('Leave the end year blank for a current position.')
            return
        }

        if (startDate && endDate && endDate < startDate) {
            setFormError('End date cannot be earlier than start date.')
            return
        }

        if (issueDate && expirationDate && expirationDate < issueDate) {
            setFormError('Expiration date cannot be earlier than issue date.')
            return
        }

        setFormError('')

        const existing = entries.find(
            (entry) => entry.id === editingId,
        )

        const nextOrder = entries.length
            ? Math.max(...entries.map((entry) => entry.displayOrder)) + 1
            : 0

        const saved = {
            ...createEmpty(),
            ...draft,
            id: editingId ?? makeId(),
            displayOrder: existing?.displayOrder ?? nextOrder,
        } as T

        if (existing) {
            onChange(
                entries.map((entry) =>
                    entry.id === editingId ? saved : entry,
                ),
            )
        } else {
            onChange([...entries, saved])
        }

        cancel()
    }

    function remove(id: string) {
        onChange(
            entries
                .filter((entry) => entry.id !== id)
                .map((entry, index) => ({
                    ...entry,
                    displayOrder: index,
                })),
        )

        if (editingId === id) {
            cancel()
        }
    }

    function reorder(targetId: string) {
        if (!draggedId || draggedId === targetId) return

        const reordered = [...entries]

        const from = reordered.findIndex(
            (entry) => entry.id === draggedId,
        )

        const to = reordered.findIndex(
            (entry) => entry.id === targetId,
        )

        if (from < 0 || to < 0) return

        const moved = reordered[from]

        if (!moved) return

        reordered.splice(from, 1)
        reordered.splice(to, 0, moved)

        onChange(
            reordered.map((entry, index) => ({
                ...entry,
                displayOrder: index,
            })),
        )

        setDraggedId(null)
    }

    return (
        <div className="space-y-3">
            {entries
                .slice()
                .sort((a, b) => a.displayOrder - b.displayOrder)
                .map((entry) => (
                    <div
                        key={entry.id}
                        draggable
                        onDragStart={() => {
                            setDraggedId(entry.id)
                        }}
                        onDragOver={(event) => {
                            event.preventDefault()
                        }}
                        onDrop={(event) => {
                            event.preventDefault()
                            reorder(entry.id)
                        }}
                        onDragEnd={() => {
                            setDraggedId(null)
                        }}
                        className="flex items-center gap-3 rounded-md border border-slate-200 bg-slate-50 p-3 dark:border-white/10 dark:bg-white/[0.03]"
                    >
                        <GripVertical
                            size={18}
                            className="shrink-0 cursor-grab text-slate-400"
                        />

                        <div className="min-w-0 flex-1">
                            <p className="text-xs font-semibold text-slate-700 dark:text-slate-200">
                                {getTitle(entry) || 'Untitled entry'}
                            </p>

                            {getSubtitle && getSubtitle(entry) && (
                                <p className="mt-1 text-[10px] text-slate-500 dark:text-slate-400">
                                    {getSubtitle(entry)}
                                </p>
                            )}
                        </div>

                        <div className="flex shrink-0 items-center gap-2">
                            <button
                                type="button"
                                onClick={() => {
                                    openEdit(entry)
                                }}
                                aria-label="Edit entry"
                                className="rounded p-1 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-500/10"
                            >
                                <Pencil size={15} />
                            </button>

                            <button
                                type="button"
                                onClick={() => {
                                    remove(entry.id)
                                }}
                                aria-label="Delete entry"
                                className="rounded p-1 text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10"
                            >
                                <Trash2 size={15} />
                            </button>
                        </div>
                    </div>
                ))}

            {entries.length === 0 && <EmptySection />}

            {isOpen && (
                <form
                    onSubmit={save}
                    className="space-y-3 rounded-lg border border-blue-200 bg-blue-50/50 p-4 dark:border-blue-400/20 dark:bg-blue-500/5"
                >
                    <h4 className="text-base font-semibold text-slate-700 dark:text-slate-200">
                        {editingId ? `Edit ${formTitle}` : `Add ${formTitle}`}
                    </h4>

                    {formError && (
                        <p role="alert" className="text-sm font-medium text-red-600">
                            {formError}
                        </p>
                    )}

                    <div className="grid gap-3 sm:grid-cols-2">
                        {fields.map((field) => {
                            const key = String(field.key)
                            const value = draft[key]

                            const commonClass =
                                'w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500 dark:border-white/15 dark:bg-slate-900 dark:text-white'

                            if (field.type === 'checkbox') {
                                return (
                                    <label
                                        key={key}
                                        className="flex items-center gap-2 self-end pb-2 text-xs text-slate-700 dark:text-slate-200"
                                    >
                                        <input
                                            type="checkbox"
                                            checked={Boolean(value)}
                                            onChange={(event) => {
                                                setDraft((current) => ({
                                                    ...current,
                                                    [key]: event.target.checked,
                                                }))
                                            }}
                                        />
                                        {field.label}
                                    </label>
                                )
                            }

                            return (
                                <div
                                    key={key}
                                    className={
                                        field.type === 'textarea'
                                            ? 'sm:col-span-2'
                                            : ''
                                    }
                                >
                                    <label className="mb-1.5 block text-sm font-semibold text-slate-700 dark:text-slate-200">
                                        {field.label}
                                        {field.required !== false ? ' *' : ''}
                                    </label>

                                    {field.type === 'select' ? (
                                        <select
                                            required={field.required !== false}
                                            value={String(value ?? '')}
                                            onChange={(event) => {
                                                setDraft((current) => ({
                                                    ...current,
                                                    [key]: event.target.value,
                                                }))
                                            }}
                                            className={commonClass}
                                        >
                                            <option value="">
                                                Select {field.label.toLowerCase()}
                                            </option>

                                            {field.options?.map((option) => (
                                                <option
                                                    key={option.value}
                                                    value={option.value}
                                                >
                                                    {option.label}
                                                </option>
                                            ))}
                                        </select>
                                    ) : field.type === 'textarea' ? (
                                        <textarea
                                            required={field.required !== false}
                                            value={String(value ?? '')}
                                            onChange={(event) => {
                                                setDraft((current) => ({
                                                    ...current,
                                                    [key]: event.target.value,
                                                }))
                                            }}
                                            placeholder={field.placeholder}
                                            rows={3}
                                            className={commonClass}
                                        />
                                    ) : (
                                        <input
                                            type={
                                                field.type === 'date'
                                                    ? 'date'
                                                    : 'text'
                                            }
                                            required={field.required !== false}
                                            maxLength={field.maxLength}
                                            value={String(value ?? '')}
                                            onChange={(event) => {
                                                setDraft((current) => ({
                                                    ...current,
                                                    [key]: event.target.value,
                                                }))
                                            }}
                                            placeholder={field.placeholder}
                                            className={commonClass}
                                        />
                                    )}
                                </div>
                            )
                        })}
                    </div>

                    <div className="flex gap-2 pt-1">
                        <button
                            type="submit"
                            className="rounded-md bg-blue-600 px-4 py-2 text-[10px] font-semibold text-white hover:bg-blue-700"
                        >
                            Save
                        </button>

                        <button
                            type="button"
                            onClick={cancel}
                            className="rounded-md border border-slate-300 px-4 py-2 text-[10px] font-semibold text-slate-600 hover:bg-slate-100 dark:border-white/20 dark:text-slate-300"
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            )}

            {!isOpen && (
                <button
                    type="button"
                    onClick={openAdd}
                    className="flex w-full items-center justify-center gap-2 rounded-md border border-dashed border-blue-300 py-2 text-[11px] font-semibold text-blue-600 transition hover:bg-blue-50 dark:border-blue-400/30 dark:text-blue-400 dark:hover:bg-blue-500/10"
                >
                    <Plus size={14} />
                    {addLabel}
                </button>
            )}
        </div>
    )
}

const educationFields: FieldConfig<EducationEntry>[] = [
    { key: 'degree', label: 'Degree', placeholder: 'e.g. Bachelor of Science' },
    { key: 'discipline', label: 'Discipline', placeholder: 'e.g. Computer Science' },
    { key: 'institution', label: 'Institution', placeholder: 'e.g. University of Virginia' },
    { key: 'graduationYear', label: 'Graduation year', placeholder: 'e.g. 2027', required: false },
]

const experienceFields: FieldConfig<ExperienceEntry>[] = [
    {
        key: 'experienceType',
        label: 'Experience type',
        type: 'select',
        options: [
            { label: 'Academic', value: 'ACADEMIC' },
            { label: 'Industry', value: 'INDUSTRY' },
            { label: 'Other', value: 'OTHER' },
        ],
    },
    { key: 'organisation', label: 'Organization' },
    { key: 'positionTitle', label: 'Position title' },
    { key: 'academicRank', label: 'Academic rank', required: false },
    { key: 'startYear', label: 'Start year' },
    { key: 'endYear', label: 'End year', required: false },
    {
        key: 'employmentType',
        label: 'Employment type',
        type: 'select',
        options: [
            { label: 'Full-time', value: 'FULL_TIME' },
            { label: 'Part-time', value: 'PART_TIME' },
        ],
    },
    { key: 'isCurrent', label: 'Currently in this position', type: 'checkbox' },
]

const credentialFields: FieldConfig<CredentialEntry>[] = [
    {
        key: 'credentialType',
        label: 'Credential type',
        type: 'select',
        options: [
            { label: 'Licence', value: 'LICENCE' },
            { label: 'Award', value: 'AWARD' },
            { label: 'Certification', value: 'CERTIFICATION' },
            { label: 'Other', value: 'OTHER' },
        ],
    },
    { key: 'name', label: 'Name' },
    { key: 'issuingOrganisation', label: 'Issuing organization', required: false },
    { key: 'credentialNumber', label: 'Credential number', required: false },
    { key: 'issueDate', label: 'Issue date', type: 'date', required: false },
    { key: 'expirationDate', label: 'Expiration date', type: 'date', required: false },
]

const developmentFields: FieldConfig<ProfessionalDevelopmentEntry>[] = [
    { key: 'activityName', label: 'Activity name', maxLength: 20 },
    { key: 'provider', label: 'Provider', required: false },
    { key: 'startDate', label: 'Start date', type: 'date', required: false },
    { key: 'endDate', label: 'End date', type: 'date', required: false },
    { key: 'description', label: 'Description', type: 'textarea', required: false },
]

const contributionFields: FieldConfig<ContributionEntry>[] = [
    { key: 'title', label: 'Title' },
    { key: 'citation', label: 'Citation', type: 'textarea', required: false },
    { key: 'venueOrOrganisation', label: 'Venue or organization', required: false },
    { key: 'contributionDate', label: 'Date', type: 'date', required: false },
    { key: 'description', label: 'Description', type: 'textarea', required: false },
]

export function VitaeBuilderPage() {
    const [vitae, setVitae] = useState<VitaeData>(() =>
        createInitialVitaeData(''),
    )

    const updateName = (name: string) => {
        setVitae((current) => ({ ...current, name }))
    }

    const updateExperience = (entries: ExperienceEntry[]) => {
        setVitae((current) => ({
            ...current,
            academicExperience: entries.filter(
                (entry) => entry.experienceType === 'ACADEMIC',
            ),
            professionalExperience: entries.filter(
                (entry) => entry.experienceType !== 'ACADEMIC',
            ),
        }))
    }

    const experienceEntries = [
        ...vitae.academicExperience,
        ...vitae.professionalExperience,
    ].sort((a, b) => {
        if (a.isCurrent !== b.isCurrent) return a.isCurrent ? -1 : 1
        return Number(b.startYear || 0) - Number(a.startYear || 0)
    })

    const sortedEducation = [...vitae.education].sort(
        (a, b) => Number(b.graduationYear || 0) - Number(a.graduationYear || 0),
    )
    const sortedCredentials = [...vitae.credentials].sort(
        (a, b) => (b.issueDate || '').localeCompare(a.issueDate || ''),
    )
    const sortedDevelopment = [...vitae.professionalDevelopment].sort(
        (a, b) => (b.startDate || '').localeCompare(a.startDate || ''),
    )
    const sortedService = [...vitae.service].sort(
        (a, b) => (b.contributionDate || '').localeCompare(a.contributionDate || ''),
    )
    const sortedPublications = [...vitae.publicationsPresentations].sort(
        (a, b) => (b.contributionDate || '').localeCompare(a.contributionDate || ''),
    )

    const contributionEntries = [...sortedService, ...sortedPublications]

    const completedSections = [
        vitae.name.trim().length > 0,
        vitae.education.length > 0,
        experienceEntries.length > 0,
        vitae.credentials.length > 0,
        vitae.professionalDevelopment.length > 0,
        contributionEntries.length > 0,
    ].filter(Boolean).length

    return (
        <main className="min-h-screen py-6">
            <style>{`
                @media print {
                    @page { size: letter; margin: 1in; }
                    body * { visibility: hidden !important; }
                    .vitae-pdf-document,
                    .vitae-pdf-document * { visibility: visible !important; }
                    .vitae-pdf-document {
                        position: absolute;
                        left: 0;
                        top: 0;
                        width: 100%;
                        max-width: none !important;
                        min-height: 0 !important;
                        margin: 0 !important;
                        padding: 0 !important;
                        box-shadow: none !important;
                    }
                }
            `}</style>
            <div className="mb-7 flex flex-wrap items-start justify-between gap-4">
                <div>
                    <div className="mb-3 flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                        <Link to="/" className="hover:text-blue-600">
                            My workspace
                        </Link>
                        <span>/</span>
                        <span className="font-medium text-blue-700 dark:text-blue-400">
                            Vitae Builder
                        </span>
                    </div>

                    <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
                        Build Your Vitae
                    </h1>

                    <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                        Create and maintain your ABET faculty vitae. Your
                        document updates as you edit.
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        type="button"
                        onClick={() => {
                            window.print()
                        }}
                        className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
                    >
                        <FileText size={16} />
                        Download PDF
                    </button>
                    <Link to="/" className="text-button">
                        Back to Overview
                    </Link>
                </div>
            </div>

            <div className="grid items-start gap-5 xl:grid-cols-[0.88fr_1.12fr]">
                <section>
                    <div className="mb-4 flex items-center justify-between gap-3">
                        <div>
                            <h2 className="text-sm font-bold uppercase tracking-wide text-slate-700 dark:text-slate-200">
                                Your Vitae Sections
                            </h2>

                            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                                Add, edit, delete, and reorder entries below.
                            </p>
                        </div>

                        <span className="whitespace-nowrap rounded-full bg-teal-100 px-3 py-1.5 text-[10px] font-semibold text-teal-700 dark:bg-teal-500/15 dark:text-teal-300">
                            {completedSections} of 6 sections complete
                        </span>
                    </div>

                    <div className="space-y-3">
                        <SectionCard
                            title="Name"
                            icon={<UserRound size={17} />}
                            color="blue"
                            count={vitae.name.trim() ? 1 : 0}
                        >
                            <FieldLabel htmlFor="vitae-name">
                                Full name
                            </FieldLabel>

                            <input
                                id="vitae-name"
                                value={vitae.name}
                                onChange={(event) => {
                                    updateName(event.target.value)
                                }}
                                placeholder="Enter your full name"
                                className={inputClass}
                            />
                        </SectionCard>

                        <SectionCard
                            title="Education"
                            icon={<GraduationCap size={17} />}
                            color="blue"
                            count={vitae.education.length}
                        >
                            <EditableEntryList<EducationEntry>
                                entries={vitae.education}
                                fields={educationFields}
                                createEmpty={() => ({
                                    degree: '',
                                    discipline: '',
                                    institution: '',
                                    graduationYear: '',
                                })}
                                onChange={(education) => {
                                    setVitae((current) => ({
                                        ...current,
                                        education,
                                    }))
                                }}
                                getTitle={(entry) =>
                                    `${entry.degree} in ${entry.discipline}`
                                }
                                getSubtitle={(entry) =>
                                    `${entry.institution} · ${entry.graduationYear}`
                                }
                                addLabel="Add Education"
                                formTitle="Education"
                            />
                        </SectionCard>

                        <SectionCard
                            title="Academic and Professional Experience"
                            icon={<BriefcaseBusiness size={17} />}
                            color="blue"
                            count={experienceEntries.length}
                        >
                            <EditableEntryList<ExperienceEntry>
                                entries={experienceEntries}
                                fields={experienceFields}
                                createEmpty={() => ({
                                    experienceType: 'INDUSTRY',
                                    organisation: '',
                                    academicRank: '',
                                    positionTitle: '',
                                    startYear: '',
                                    endYear: '',
                                    isCurrent: false,
                                    employmentType: 'FULL_TIME',
                                })}
                                onChange={updateExperience}
                                getTitle={(entry) =>
                                    `${entry.positionTitle} · ${entry.organisation}`
                                }
                                getSubtitle={(entry) =>
                                    `${entry.experienceType} · ${entry.startYear}–${entry.isCurrent ? 'Present' : entry.endYear}`
                                }
                                addLabel="Add Experience"
                                formTitle="Experience"
                            />
                        </SectionCard>

                        <SectionCard
                            title="Professional Credentials, Certifications, or Licensing"
                            icon={<Award size={17} />}
                            color="blue"
                            count={vitae.credentials.length}
                        >
                            <EditableEntryList<CredentialEntry>
                                entries={vitae.credentials}
                                fields={credentialFields}
                                createEmpty={() => ({
                                    credentialType: 'CERTIFICATION',
                                    name: '',
                                    issuingOrganisation: '',
                                    credentialNumber: '',
                                    issueDate: '',
                                    expirationDate: '',
                                })}
                                onChange={(credentials) => {
                                    setVitae((current) => ({
                                        ...current,
                                        credentials,
                                    }))
                                }}
                                getTitle={(entry) => entry.name}
                                getSubtitle={(entry) =>
                                    [
                                        entry.issuingOrganisation,
                                        entry.credentialType,
                                    ]
                                        .filter(Boolean)
                                        .join(' · ')
                                }
                                addLabel="Add Credential"
                                formTitle="Credential"
                            />
                        </SectionCard>

                        <SectionCard
                            title="Professional Development Activities"
                            icon={<BookOpen size={17} />}
                            color="blue"
                            count={vitae.professionalDevelopment.length}
                        >
                            <EditableEntryList<ProfessionalDevelopmentEntry>
                                entries={vitae.professionalDevelopment}
                                fields={developmentFields}
                                createEmpty={() => ({
                                    activityName: '',
                                    provider: '',
                                    startDate: '',
                                    endDate: '',
                                    description: '',
                                })}
                                onChange={(professionalDevelopment) => {
                                    setVitae((current) => ({
                                        ...current,
                                        professionalDevelopment,
                                    }))
                                }}
                                getTitle={(entry) => entry.activityName}
                                getSubtitle={(entry) =>
                                    [
                                        entry.provider,
                                        entry.startDate,
                                        entry.endDate,
                                    ]
                                        .filter(Boolean)
                                        .join(' · ')
                                }
                                addLabel="Add Professional Development"
                                formTitle="Professional Development Activity"
                            />
                        </SectionCard>

                        <SectionCard
                            title="Contributions to the Discipline"
                            icon={<Users size={17} />}
                            color="blue"
                            count={contributionEntries.length}
                        >
                            <div className="space-y-5">
                                <div>
                                    <p className="mb-2 border-b border-slate-200 pb-2 text-xs font-bold text-slate-700 dark:border-white/10 dark:text-slate-200">
                                        Service
                                    </p>

                                    <EditableEntryList<ContributionEntry>
                                        entries={vitae.service}
                                        fields={contributionFields}
                                        createEmpty={() => ({
                                            contributionType: 'SERVICE',
                                            title: '',
                                            citation: '',
                                            venueOrOrganisation: '',
                                            contributionDate: '',
                                            description: '',
                                        })}
                                        onChange={(service) => {
                                            setVitae((current) => ({
                                                ...current,
                                                service,
                                            }))
                                        }}
                                        getTitle={(entry) => entry.title}
                                        getSubtitle={(entry) =>
                                            entry.venueOrOrganisation ||
                                            entry.contributionDate
                                        }
                                        addLabel="Add Service Entry"
                                        formTitle="Service Entry"
                                    />
                                </div>

                                <div>
                                    <p className="mb-2 border-b border-slate-200 pb-2 text-xs font-bold text-slate-700 dark:border-white/10 dark:text-slate-200">
                                        Publications / Presentations
                                    </p>

                                    <EditableEntryList<ContributionEntry>
                                        entries={vitae.publicationsPresentations}
                                        fields={contributionFields}
                                        createEmpty={() => ({
                                            contributionType: 'PUBLICATION_PRESENTATION',
                                            title: '',
                                            citation: '',
                                            venueOrOrganisation: '',
                                            contributionDate: '',
                                            description: '',
                                        })}
                                        onChange={(publicationsPresentations) => {
                                            setVitae((current) => ({
                                                ...current,
                                                publicationsPresentations,
                                            }))
                                        }}
                                        getTitle={(entry) => entry.title}
                                        getSubtitle={(entry) =>
                                            entry.citation ||
                                            entry.venueOrOrganisation
                                        }
                                        addLabel="Add Publication / Presentation"
                                        formTitle="Publication / Presentation"
                                    />
                                </div>
                            </div>
                        </SectionCard>
                    </div>
                </section>

                <aside className="min-w-0 xl:sticky xl:top-5">
                    <div className="overflow-hidden rounded-xl border border-slate-200 bg-slate-100 shadow-sm dark:border-white/10 dark:bg-slate-800">
                        <div className="flex items-center justify-between border-b border-slate-200 bg-white px-4 py-3 dark:border-white/10 dark:bg-slate-900">
                            <div className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-200">
                                <FileText
                                    size={16}
                                    className="text-blue-700 dark:text-blue-400"
                                />
                                Live document preview
                            </div>

                            <span className="rounded-full bg-slate-100 px-3 py-1 text-[10px] font-semibold text-slate-600 dark:bg-white/10 dark:text-slate-300">
                                Preview
                            </span>
                        </div>

                        <div className="overflow-x-auto p-4 sm:p-6">
                            <div className="vitae-pdf-document mx-auto min-h-[850px] w-full max-w-[565px] bg-white px-10 py-12 font-[Arial] text-[10pt] leading-[1.5] text-black shadow-lg sm:px-14 sm:py-14">
                                <h1 className="border-b border-slate-500 pb-3 text-center text-base font-bold uppercase">
                                    {vitae.name || 'Your Name'}
                                </h1>

                                <PreviewSection title="1. Education">
                                    {sortedEducation.map((entry) => (
                                        <CvEntry
                                            key={entry.id}
                                            date={entry.graduationYear || ''}
                                            title={entry.institution}
                                            subtitle={[entry.degree, entry.discipline].filter(Boolean).join(' in ')}
                                        />
                                    ))}
                                </PreviewSection>

                                <PreviewSection title="2. Academic and Professional Experience">
                                    {experienceEntries.map((entry) => (
                                        <CvEntry
                                            key={entry.id}
                                            date={`${entry.startYear}–${entry.isCurrent ? 'Present' : entry.endYear || 'Present'}`}
                                            title={entry.organisation}
                                            subtitle={entry.positionTitle}
                                            details={[
                                                entry.academicRank,
                                                entry.employmentType === 'FULL_TIME' ? 'Full-time' : 'Part-time',
                                            ].filter((value): value is string => Boolean(value))}
                                        />
                                    ))}
                                </PreviewSection>

                                <PreviewSection title="3. Professional Credentials, Certifications, or Licensing">
                                    {sortedCredentials.map((entry) => (
                                        <CvEntry
                                            key={entry.id}
                                            date={formatCvDate(entry.issueDate)}
                                            title={entry.name}
                                            subtitle={entry.issuingOrganisation || undefined}
                                            details={[
                                                entry.credentialType,
                                                entry.expirationDate ? `Expires ${formatCvDate(entry.expirationDate)}` : '',
                                                entry.credentialNumber ? `Credential no. ${entry.credentialNumber}` : '',
                                            ].filter(Boolean)}
                                        />
                                    ))}
                                </PreviewSection>

                                <PreviewSection title="4. Professional Development Activities">
                                    {sortedDevelopment.map((entry) => (
                                        <CvEntry
                                            key={entry.id}
                                            date={formatCvDateRange(entry.startDate, entry.endDate)}
                                            title={entry.activityName}
                                            subtitle={entry.provider || undefined}
                                            detail={entry.description || undefined}
                                        />
                                    ))}
                                </PreviewSection>

                                <PreviewSection title="5. Contributions to the Discipline">
                                    <p className="mb-1 font-bold">Service</p>

                                    {sortedService.map((entry) => (
                                        <CvEntry
                                            key={entry.id}
                                            date={formatCvDate(entry.contributionDate)}
                                            title={entry.title}
                                            subtitle={entry.venueOrOrganisation || undefined}
                                            detail={entry.description || undefined}
                                        />
                                    ))}

                                    <p className="mb-1 mt-3 font-bold">
                                        Publications / Presentations
                                    </p>

                                    {sortedPublications.map((entry) => (
                                        <CvEntry
                                            key={entry.id}
                                            date={formatCvDate(entry.contributionDate)}
                                            title={entry.title}
                                            subtitle={entry.venueOrOrganisation || undefined}
                                            detail={entry.citation || entry.description || undefined}
                                        />
                                    ))}
                                </PreviewSection>

                            </div>
                        </div>

                        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-200 px-4 py-2 text-[9px] text-slate-500 dark:border-white/10">
                            <span>US Letter · 8.5 × 11 in</span>
                            <span>Document preview</span>
                        </div>
                    </div>
                </aside>
            </div>

            <div className="mt-5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] text-slate-500 dark:text-slate-400">
                <span className="font-bold">ABET FORMAT REFERENCE</span>
                <span>≤ 3 pages</span>
                <span>·</span>
                <span>≥ 1-inch margins</span>
                <span>·</span>
                <span>≤ 6 lines/inch</span>
                <span>·</span>
                <span>Arial, Courier New, or Palatino Linotype ≥ 10 pt</span>
                <span>·</span>
                <span>Times New Roman ≥ 11 pt</span>
                <span className="basis-full pt-1">
                    These are reference requirements. The current preview does
                    not yet validate formatting compliance.
                </span>
            </div>
        </main>
    )
}

const inputClass =
    'w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none transition placeholder:text-sm placeholder:text-slate-400 focus:ring-2 focus:ring-blue-100 dark:border-white/15 dark:bg-slate-900 dark:text-white'

function FieldLabel({
                        htmlFor,
                        children,
                    }: {
    htmlFor: string
    children: ReactNode
}) {
    return (
        <label
            htmlFor={htmlFor}
            className="mb-1.5 block text-sm font-semibold text-slate-700 dark:text-slate-200"
        >
            {children}
        </label>
    )
}

type SectionColor = 'blue' | 'purple' | 'teal'

function SectionCard({
                         title,
                         icon,
                         color,
                         count,
                         children,
                     }: {
    title: string
    icon: ReactNode
    color: SectionColor
    count?: number
    children: ReactNode
}) {
    const styles: Record<SectionColor, { border: string; icon: string; title: string }> = {
        blue: {
            border: 'border-l-blue-600',
            icon: 'bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-300',
            title: 'text-blue-700 dark:text-blue-300',
        },
        purple: {
            border: 'border-l-violet-600',
            icon: 'bg-violet-100 text-violet-700 dark:bg-violet-500/15 dark:text-violet-300',
            title: 'text-violet-700 dark:text-violet-300',
        },
        teal: {
            border: 'border-l-teal-600',
            icon: 'bg-teal-100 text-teal-700 dark:bg-teal-500/15 dark:text-teal-300',
            title: 'text-teal-700 dark:text-teal-300',
        },
    }

    return (
        <section
            className={`rounded-lg border border-l-[3px] border-slate-200 bg-white p-4 shadow-sm ${styles[color].border} dark:border-white/10 dark:bg-slate-900`}
        >
            <div className="mb-4 flex items-center justify-between gap-2 border-b border-slate-200 pb-3 dark:border-white/10">
                <div className="flex min-w-0 items-center gap-2.5">
                    <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-md ${styles[color].icon}`}>
                        {icon}
                    </span>
                    <h3 className={`text-lg font-bold ${styles[color].title}`}>
                        {title}
                    </h3>
                </div>
                {count !== undefined && (
                    <span className="shrink-0 text-[10px] text-slate-400">
                        {count} entries
                    </span>
                )}
            </div>
            <div>{children}</div>
        </section>
    )
}

function EmptySection() {
    return <p className="py-2 text-[10px] text-slate-400">No entries added yet.</p>
}

function PreviewSection({
                            title,
                            children,
                        }: {
    title: string
    children: ReactNode
}) {
    return (
        <section className="mt-5 break-inside-avoid">
            <h2 className="mb-2 border-b border-slate-300 pb-1 text-[10pt] font-bold uppercase">
                {title}
            </h2>
            <div className="space-y-2">{children}</div>
        </section>
    )
}

function CvEntry({
                     date,
                     title,
                     subtitle,
                     detail,
                     details,
                 }: {
    date: string
    title: string
    subtitle?: string
    detail?: string
    details?: string[]
}) {
    const bulletItems = [...(details ?? []), ...(detail ? [detail] : [])]

    return (
        <div className="grid grid-cols-[88px_minmax(0,1fr)] gap-x-3 break-inside-avoid text-[10pt] leading-[1.35]">
            <div className="pt-0.5 text-left text-[9pt] text-slate-700">
                {date}
            </div>
            <div className="min-w-0">
                <p className="font-bold">{title}</p>
                {subtitle && <p>{subtitle}</p>}
                {bulletItems.length > 0 && (
                    <ul className="mt-1 list-disc space-y-0.5 pl-4">
                        {bulletItems.map((item, index) => (
                            <li key={`${String(index)}-${item}`}>{item}</li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    )
}

function formatCvDate(value: string) {
    if (!value) return ''
    const [year, month] = value.split('-')
    if (!year || !month) return value
    return new Date(Number(year), Number(month) - 1, 1).toLocaleDateString('en-US', {
        month: 'short',
        year: 'numeric',
    })
}

function formatCvDateRange(startDate: string, endDate: string) {
    if (!startDate && !endDate) return ''
    if (startDate && endDate) {
        return `${formatCvDate(startDate)}–${formatCvDate(endDate)}`
    }
    return formatCvDate(startDate || endDate)
}
