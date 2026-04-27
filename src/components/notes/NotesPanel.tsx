import ContextPanel from "@/components/layout/ContextPanel";

export default function NotesPanel() {
  return (
    <ContextPanel title="메모">
      <div className="flex flex-1 items-center justify-center p-4">
        <p className="text-xs text-zinc-300">메모가 없습니다</p>
      </div>
    </ContextPanel>
  );
}
