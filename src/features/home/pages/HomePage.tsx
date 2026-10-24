import { useWorkspace } from '../../../app/workspaceContext'
import { HomeExperience } from './HomeExperience'

export function HomePage() {
  const workspace = useWorkspace()

  return (
    <HomeExperience
      data={workspace.data}
      onOnboardFaculty={workspace.onOnboardFaculty}
      onboardingSubmitting={workspace.onboardingSubmitting}
      onboardingError={workspace.onboardingError}
    />
  )
}
