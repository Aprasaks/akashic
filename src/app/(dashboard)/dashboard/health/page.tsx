import EditorPanel from "@/components/layout/EditorPanel";
import HealthMain from "@/components/health/HealthMain";

export default function HealthPage() {
  return (
    <div className="flex h-full">
      <HealthMain />
      <EditorPanel />
    </div>
  );
}
