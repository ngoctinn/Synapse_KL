import { getOperationalSettings } from "@/features/system-settings/api";
import { OperationalSettings } from "@/features/system-settings/components/operational-settings";

export default async function SettingsPage() {
  const initialData = await getOperationalSettings().catch(() => null);

  return (
    <div className="flex flex-col gap-8">
      <OperationalSettings initialData={initialData} />
    </div>
  )
}
