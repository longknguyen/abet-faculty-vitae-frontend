import type { HomeData } from './homeSchemas'

export type HomeView =
  | 'ADMIN'
  | 'ADMIN_FACULTY'
  | 'FIRST_TIME_FACULTY'
  | 'RETURNING_FACULTY'

export function deriveHomeView(homeData: HomeData): HomeView {
  const roles = new Set(homeData.currentUser.roles)
  const isAdmin = roles.has('ADMIN')
  const isFaculty = roles.has('FACULTY')

  if (isAdmin && isFaculty) {
    return 'ADMIN_FACULTY'
  }
  if (isAdmin) {
    return 'ADMIN'
  }
  if (isFaculty) {
   // return homeData.personalVitae?.sourceCv === null || homeData.personalVitae === null
    return homeData.onboardingNeeded
      ? 'FIRST_TIME_FACULTY'
      : 'RETURNING_FACULTY'
  }

  throw new Error('The authenticated account has no supported application role')
}
