import ContextPanel from "@/components/layout/ContextPanel";

export default function HealthPanel() {
  return (
    <ContextPanel title="건강">
      <div className="flex flex-1 items-center justify-center p-4">
        <p className="text-xs text-zinc-300">기록이 없습니다</p>
      </div>
    </ContextPanel>
  );
}
