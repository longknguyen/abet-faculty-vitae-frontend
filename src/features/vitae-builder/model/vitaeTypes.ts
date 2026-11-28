export type ExperienceType = 'ACADEMIC' | 'INDUSTRY' | 'OTHER'

export type EmploymentType = 'FULL_TIME' | 'PART_TIME'

export type CredentialType =
    | 'LICENCE'
    | 'AWARD'
    | 'CERTIFICATION'
    | 'OTHER'

export type ContributionType =
    | 'SERVICE'
    | 'PUBLICATION_PRESENTATION'

export interface EducationEntry {
    id: string
    degree: string
    discipline: string
    institution: string
    graduationYear: string
    displayOrder: number
}

export interface ExperienceEntry {
    id: string
    experienceType: ExperienceType
    organisation: string
    academicRank: string
    positionTitle: string
    startYear: string
    endYear: string
    isCurrent: boolean
    employmentType: EmploymentType
    displayOrder: number
}

export interface CredentialEntry {
    id: string
    credentialType: CredentialType
    name: string
    issuingOrganisation: string
    credentialNumber: string
    issueDate: string
    expirationDate: string
    displayOrder: number
}

export interface ProfessionalDevelopmentEntry {
    id: string
    activityName: string
    provider: string
    startDate: string
    endDate: string
    description: string
    displayOrder: number
}

export interface ContributionEntry {
    id: string
    contributionType: ContributionType
    title: string
    citation: string
    venueOrOrganisation: string
    contributionDate: string
    description: string
    displayOrder: number
}

export interface VitaeData {
    name: string
    education: EducationEntry[]
    academicExperience: ExperienceEntry[]
    professionalExperience: ExperienceEntry[]
    credentials: CredentialEntry[]
    professionalDevelopment: ProfessionalDevelopmentEntry[]
    service: ContributionEntry[]
    publicationsPresentations: ContributionEntry[]
}

export const VITAE_SECTIONS = [
    { id: 'name', title: 'Name' },
    { id: 'education', title: 'Education' },
    { id: 'experience', title: 'Academic and Professional Experience' },
    {
        id: 'credentials',
        title: 'Professional Credentials, Certifications, or Licensing',
    },
    {
        id: 'professionalDevelopment',
        title: 'Professional Development Activities',
    },
    { id: 'contributions', title: 'Contributions to the Discipline' },
] as const