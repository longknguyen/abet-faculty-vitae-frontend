import { useState } from 'react'

import { AdminOverview } from '../components/AdminOverview'
import { FacultyOnboardingForm } from '../components/FacultyOnboarding'
import { FacultyRecordDialog } from '../components/FacultyRecordDialog'
import { PersonalVitaeSection } from '../components/PersonalVitaeSection'
import { CvUploadDialog } from '../components/CvUploadDialog'
import type { FacultyOnboardingRequest } from '../api/HomeApi'
import type { CvUploadState } from '../hooks/useHomeController'
import { deriveHomeView } from '../model/deriveHomeView'
import type { FacultyRecord, HomeData } from '../model/homeSchemas'

interface HomeExperienceProps {
  data: HomeData
  onOnboardFaculty: (request: FacultyOnboardingRequest) => Promise<void>
  onboardingSubmitting: boolean
  onboardingError: string | null
  cvUploadState: CvUploadState
  onUploadCv: (file: File) => Promise<void>
}

export function HomeExperience({
  data,
  onOnboardFaculty,
  onboardingSubmitting,
  onboardingError,
  cvUploadState,
  onUploadCv,
}: HomeExperienceProps) {
  const view = deriveHomeView(data)
  const [selectedFaculty, setSelectedFaculty] = useState<FacultyRecord>()
  const [profileSetupOpen, setProfileSetupOpen] = useState(false)
  const [cvUploadOpen, setCvUploadOpen] = useState(false)
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
            onStartImport={() => {
              if (data.onboardingNeeded) {
                setProfileSetupOpen(true)
              } else {
                setCvUploadOpen(true)
              }
            }}
            personalVitae={data.personalVitae}
            surname={data.currentUser.surname}
            uploadState={cvUploadState}
          />
        ) : null}
        {showAdmin && <AdminOverview cycle={data.cycle} displayName={data.currentUser.displayName} onSelect={setSelectedFaculty} records={data.facultyRecords} />}
      </main>
      <FacultyRecordDialog onClose={() => { setSelectedFaculty(undefined) }} record={selectedFaculty} />
      <CvUploadDialog
        open={cvUploadOpen}
        state={cvUploadState}
        onClose={() => { setCvUploadOpen(false) }}
        onUpload={onUploadCv}
      />
    </>
  )
}
