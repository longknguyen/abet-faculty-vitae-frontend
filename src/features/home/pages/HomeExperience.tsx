import { useState } from 'react'

import { AdminOverview } from '../components/AdminOverview'
import { FacultyOnboardingForm } from '../components/FacultyOnboarding'
import { FacultyRecordDialog } from '../components/FacultyRecordDialog'
import { PersonalVitaeSection } from '../components/PersonalVitaeSection'
import type { FacultyOnboardingRequest } from '../api/HomeApi'
import { deriveHomeView } from '../model/deriveHomeView'
import type { FacultyRecord, HomeData } from '../model/homeSchemas'

interface HomeExperienceProps {
  data: HomeData
  onOnboardFaculty: (request: FacultyOnboardingRequest) => Promise<void>
  onboardingSubmitting: boolean
  onboardingError: string | null
}

export function HomeExperience({ data, onOnboardFaculty, onboardingSubmitting, onboardingError }: HomeExperienceProps) {
  const view = deriveHomeView(data)
  const [selectedFaculty, setSelectedFaculty] = useState<FacultyRecord>()
  const [profileSetupOpen, setProfileSetupOpen] = useState(false)
  const showPersonal = view !== 'ADMIN'
  const showAdmin = view === 'ADMIN' || view === 'ADMIN_FACULTY'
  const showProfileSetup = showPersonal && data.onboardingNeeded && profileSetupOpen

  return (
    <>
      <main id="overview">
        {showProfileSetup ? (
          <FacultyOnboardingForm
            displayName={data.currentUser.displayName}
            surname={data.currentUser.surname}
            submitting={onboardingSubmitting}
            error={onboardingError}
            onCancel={() => { setProfileSetupOpen(false) }}
            onSubmit={(request) => {
              void onOnboardFaculty(request)
            }}
          />
        ) : showPersonal ? (
          <PersonalVitaeSection
            cycle={data.cycle}
            displayName={data.currentUser.displayName}
            onboardingNeeded={data.onboardingNeeded}
            onStartImport={() => { setProfileSetupOpen(true) }}
            personalVitae={data.personalVitae}
            surname={data.currentUser.surname}
          />
        ) : null}
        {showAdmin && <AdminOverview cycle={data.cycle} displayName={data.currentUser.displayName} onSelect={setSelectedFaculty} records={data.facultyRecords} />}
      </main>
      <FacultyRecordDialog onClose={() => { setSelectedFaculty(undefined) }} record={selectedFaculty} />
    </>
  )
}
