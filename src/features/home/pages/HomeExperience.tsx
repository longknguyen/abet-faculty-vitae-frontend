import { useState } from 'react'

import { AdminOverview } from '../components/AdminOverview'
import { FacultyRecordDialog } from '../components/FacultyRecordDialog'
import { HomeShell } from '../components/HomeShell'
import { PersonalVitaeSection } from '../components/PersonalVitaeSection'
import { UploadCvDialog } from '../components/UploadCvDialog'
import { deriveHomeView } from '../model/deriveHomeView'
import type { FacultyRecord, HomeData } from '../model/homeSchemas'

interface HomeExperienceProps {
  data: HomeData
  mutationError?: string
  mutationPending: boolean
  uploadCv: (facultyCycleRecordId: string, file: File) => Promise<boolean>
  verifyFacultyRecord: (facultyCycleRecordId: string, version: number) => Promise<boolean>
}

export function HomeExperience({ data, mutationError, mutationPending, uploadCv, verifyFacultyRecord }: HomeExperienceProps) {
  const view = deriveHomeView(data)
  const [uploadOpen, setUploadOpen] = useState(false)
  const [selectedFaculty, setSelectedFaculty] = useState<FacultyRecord>()
  const showPersonal = view !== 'ADMIN'
  const showAdmin = view === 'ADMIN' || view === 'ADMIN_FACULTY'

  async function upload(file: File): Promise<boolean> {
    if (data.personalVitae === null) return false
    return uploadCv(data.personalVitae.facultyCycleRecordId, file)
  }

  async function verify(record: FacultyRecord): Promise<boolean> {
    if (record.facultyCycleRecordId === null || record.version === null) return false
    const succeeded = await verifyFacultyRecord(record.facultyCycleRecordId, record.version)
    if (succeeded) setSelectedFaculty(undefined)
    return succeeded
  }

  return (
    <HomeShell displayName={data.currentUser.displayName} roles={data.currentUser.roles}>
      <main id="overview">
        {showPersonal && <PersonalVitaeSection cycle={data.cycle} displayName={data.currentUser.displayName} onOpenUpload={() => { setUploadOpen(true) }} personalVitae={data.personalVitae} surname={data.currentUser.surname} />}
        {showAdmin && <AdminOverview cycle={data.cycle} displayName={data.currentUser.displayName} onSelect={setSelectedFaculty} records={data.facultyRecords} />}
      </main>
      <UploadCvDialog error={mutationError} onClose={() => { setUploadOpen(false) }} onUpload={upload} open={uploadOpen} pending={mutationPending} replacing={data.personalVitae !== null && data.personalVitae.sourceCv !== null} />
      <FacultyRecordDialog error={mutationError} onClose={() => { setSelectedFaculty(undefined) }} onVerify={verify} pending={mutationPending} record={selectedFaculty} />
    </HomeShell>
  )
}
