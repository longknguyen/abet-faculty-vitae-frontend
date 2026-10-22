import type { HomeData } from './homeSchemas'
import { deriveHomeView } from './deriveHomeView'

const homeData = {
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
  onboardingNeeded: true,
} satisfies HomeData

describe('deriveHomeView', () => {
  it('selects the first-time view for faculty without a CV', () => {
    expect(deriveHomeView(homeData)).toBe('FIRST_TIME_FACULTY')
  })

  it('selects the admin view for an administrator without the faculty role', () => {
    expect(
      deriveHomeView({
        ...homeData,
        currentUser: { ...homeData.currentUser, roles: ['ADMIN'] },
      }),
    ).toBe('ADMIN')
  })

  it('selects the combined view independently of personal import state', () => {
    expect(
      deriveHomeView({
        ...homeData,
        currentUser: { ...homeData.currentUser, roles: ['ADMIN', 'FACULTY'] },
      }),
    ).toBe('ADMIN_FACULTY')
  })
})
