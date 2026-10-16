import { useState } from 'react'

import { AdminOverview } from '../components/AdminOverview'
import { FacultyRecordDialog } from '../components/FacultyRecordDialog'
import { HomeShell } from '../components/HomeShell'
import { PersonalVitaeSection } from '../components/PersonalVitaeSection'
import { deriveHomeView } from '../model/deriveHomeView'
import type { FacultyRecord, HomeData } from '../model/homeSchemas'

interface HomeExperienceProps {
  data: HomeData
}

export function HomeExperience({ data }: HomeExperienceProps) {
  const view = deriveHomeView(data)
  const [selectedFaculty, setSelectedFaculty] = useState<FacultyRecord>()
  const showPersonal = view !== 'ADMIN'
  const showAdmin = view === 'ADMIN' || view === 'ADMIN_FACULTY'

  return (
    <HomeShell displayName={data.currentUser.displayName} roles={data.currentUser.roles}>
      <main id="overview">
        {showPersonal && <PersonalVitaeSection cycle={data.cycle} displayName={data.currentUser.displayName} personalVitae={data.personalVitae} surname={data.currentUser.surname} />}
        {showAdmin && <AdminOverview cycle={data.cycle} displayName={data.currentUser.displayName} onSelect={setSelectedFaculty} records={data.facultyRecords} />}
      </main>
      <FacultyRecordDialog onClose={() => { setSelectedFaculty(undefined) }} record={selectedFaculty} />
    </HomeShell>
  )
}
