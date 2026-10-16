import { homeDataSchema } from './homeSchemas'

const validHomeData = {
  currentUser: {
    id: '0199f80f-3bf3-7ed1-b5f8-060591413962',
    displayName: 'Test User',
    surname: 'User',
    roles: ['FACULTY'],
  },
  cycle: {
    id: '0199f80f-4e52-7785-ad78-da3215e9e746',
    label: 'Current cycle',
    departmentName: 'Test department',
  },
  personalVitae: null,
  facultyRecords: [],
}

describe('homeDataSchema', () => {
  it('accepts a backend-aligned home response', () => {
    expect(homeDataSchema.parse(validHomeData)).toMatchObject(validHomeData)
  })

  it('rejects unknown roles instead of trusting unvalidated JSON', () => {
    expect(() =>
      homeDataSchema.parse({
        ...validHomeData,
        currentUser: { ...validHomeData.currentUser, roles: ['SUPER_ADMIN'] },
      }),
    ).toThrow()
  })

  it('rejects workflow states that do not exist in the backend', () => {
    expect(() =>
      homeDataSchema.parse({
        ...validHomeData,
        facultyRecords: [
          {
            professorId: '0199f80f-8e55-76a4-9663-a0b49baf6cf5',
            facultyCycleRecordId: '0199f80f-98c2-72b4-9718-241321747093',
            displayName: 'Test Faculty',
            status: 'IN_REVIEW',
            updatedAt: '2026-10-15T14:30:00Z',
            version: 1,
          },
        ],
      }),
    ).toThrow()
  })
})
