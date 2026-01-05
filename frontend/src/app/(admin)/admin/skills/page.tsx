import { getSkills } from "@/features/skills/api/actions"
import { SkillManagementView } from "@/features/skills/ui"

export const dynamic = "force-dynamic"

export default async function SkillsPage() {
  const skills = await getSkills()

  return (
    <div className="p-4">
      <SkillManagementView initialSkills={skills} />
    </div>
  )
}
