import type { HomeApi } from '../api/HomeApi'
import { homeDataSchema, type HomeData } from '../model/homeSchemas'

export type MockScenario = 'admin' | 'combined' | 'first-time' | 'returning'

const userId = '0199f80f-3bf3-7ed1-b5f8-060591413962'
const cycleId = '0199f80f-4e52-7785-ad78-da3215e9e746'
const recordId = '0199f80f-6075-7264-90bb-7312387c670c'

const returningPersonalVitae = {
  facultyCycleRecordId: recordId,
  status: 'DRAFT' as const,
  contentRevision: 3,
  sourceCv: {
    uploadId: '0199f80f-6d8c-718b-b450-2bd7cb187901',
    originalFilename: 'Alex_Morgan_CV.pdf',
    jobStatus: 'SUCCEEDED' as const,
    processingStage: 'COMPLETE' as const,
  },
  nextReviewItem: {
    reviewId: '0199f80f-77b6-76d2-9152-a4db66925639',
    reviewItemId: '0199f80f-819f-7b48-aa9c-755559d7c8b5',
    section: 'EDUCATION' as const,
    title: 'Confirm graduation year',
    detail: 'Bachelor’s degree · University of Virginia',
  },
  previewSections: [
    {
      heading: 'Education',
      lines: ['PhD, Computer Science', 'University of Washington, 2018'],
    },
    {
      heading: 'Professional experience',
      lines: ['Associate Professor', 'University of Virginia'],
    },
  ],
}

const returningFaculty = homeDataSchema.parse({
  currentUser: {
    id: userId,
    displayName: 'Alex Morgan',
    surname: 'Morgan',
    roles: ['FACULTY'],
  },
  cycle: {
    id: cycleId,
    label: '2026–27',
    departmentName: 'Computer Science',
  },
  personalVitae: returningPersonalVitae,
  facultyRecords: [],
})

const facultyRecords: HomeData['facultyRecords'] = [
  {
    professorId: '0199f80f-8e55-76a4-9663-a0b49baf6cf5',
    facultyCycleRecordId: '0199f80f-98c2-72b4-9718-241321747093',
    displayName: 'Maya Patel',
    status: 'SUBMITTED',
    updatedAt: '2026-10-15T14:30:00Z',
    version: 2,
  },
  {
    professorId: '0199f80f-a2dd-7273-bc77-458c58497303',
    facultyCycleRecordId: '0199f80f-b13b-77d4-a22c-20e0941b9dc0',
    displayName: 'Sam Rivera',
    status: 'VERIFIED',
    updatedAt: '2026-10-14T15:20:00Z',
    version: 4,
  },
  {
    professorId: '0199f80f-c0b7-7821-a8e0-97cba1f0f97d',
    facultyCycleRecordId: null,
    displayName: 'Jordan Lee',
    status: null,
    updatedAt: null,
    version: null,
  },
]

export function createHomeFixture(scenario: MockScenario): HomeData {
  if (scenario === 'first-time') {
    return {
      ...returningFaculty,
      personalVitae: {
        ...returningPersonalVitae,
        contentRevision: 0,
        nextReviewItem: null,
        previewSections: [],
        sourceCv: null,
      },
    }
  }
  if (scenario === 'admin') {
    return {
      ...returningFaculty,
      currentUser: {
        ...returningFaculty.currentUser,
        displayName: 'Taylor Reed',
        roles: ['ADMIN'],
        surname: 'Reed',
      },
      facultyRecords,
      personalVitae: null,
    }
  }
  if (scenario === 'combined') {
    return {
      ...returningFaculty,
      currentUser: {
        ...returningFaculty.currentUser,
        roles: ['FACULTY', 'ADMIN'],
      },
      facultyRecords,
    }
  }
  return returningFaculty
}

function isMockScenario(value: string | undefined): value is MockScenario {
  return ['admin', 'combined', 'first-time', 'returning'].includes(value ?? '')
}

export class MockHomeApi implements HomeApi {
  private data: HomeData

  constructor(scenario?: string) {
    this.data = structuredClone(createHomeFixture(isMockScenario(scenario) ? scenario : 'returning'))
  }

  loadHome(): Promise<HomeData> {
    return Promise.resolve(structuredClone(this.data))
  }
}
