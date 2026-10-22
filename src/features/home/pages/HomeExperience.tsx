import { useState } from 'react'

import { AdminOverview } from '../components/AdminOverview'
import { FacultyRecordDialog } from '../components/FacultyRecordDialog'
import { HomeShell } from '../components/HomeShell'
import { PersonalVitaeSection } from '../components/PersonalVitaeSection'
import { deriveHomeView } from '../model/deriveHomeView'
import type { FacultyRecord, HomeData } from '../model/homeSchemas'
import type {FacultyOnboardingRequest} from "../api/HomeApi";
import { FacultyOnboardingForm} from "../components/FacultyOnboarding";

interface HomeExperienceProps {
  data: HomeData
  onOnboardFaculty: (request: FacultyOnboardingRequest) => Promise<void>
  onboardingSubmitting: boolean
  onboardingError: string | null
}

export function HomeExperience({ data, onOnboardFaculty, onboardingSubmitting, onboardingError }: HomeExperienceProps) {
  const view = deriveHomeView(data)
  const [selectedFaculty, setSelectedFaculty] = useState<FacultyRecord>()
  const showPersonal = view !== 'ADMIN'
  const showAdmin = view === 'ADMIN' || view === 'ADMIN_FACULTY'

  return (
    <HomeShell displayName={data.currentUser.displayName} roles={data.currentUser.roles}>
      <main id="overview">
        {showPersonal && data.onboardingNeeded ? (
            <FacultyOnboardingForm submitting={onboardingSubmitting}
                                   error={onboardingError}
                                   onSubmit={(request) => {
                                       void onOnboardFaculty(request)
                                   }}
            />
        ) : showPersonal ? (
            <PersonalVitaeSection cycle={data.cycle}
                                  displayName={data.currentUser.displayName}
                                  personalVitae={data.personalVitae}
                                  surname={data.currentUser.surname}
            /> ) : null }
        {showAdmin && <AdminOverview cycle={data.cycle} displayName={data.currentUser.displayName} onSelect={setSelectedFaculty} records={data.facultyRecords} />}
      </main>
      <FacultyRecordDialog onClose={() => { setSelectedFaculty(undefined) }} record={selectedFaculty} />
    </HomeShell>
  )
}
