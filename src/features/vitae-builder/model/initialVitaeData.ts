import type { VitaeData } from './vitaeTypes'

export function createInitialVitaeData(name: string): VitaeData {
    return {
        name,
        education: [],
        academicExperience: [],
        professionalExperience: [],
        credentials: [],
        professionalDevelopment: [],
        service: [],
        publicationsPresentations: [],
    }
}