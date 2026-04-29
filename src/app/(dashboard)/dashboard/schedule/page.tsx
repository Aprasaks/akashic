import EditorPanel from "@/components/layout/EditorPanel";
import ScheduleForm from "@/components/schedule/ScheduleForm";

export default function SchedulePage() {
  return (
    <div className="flex h-full">
      <div className="flex flex-1 items-center justify-center">
        <p className="text-sm text-zinc-300">날짜를 선택하세요</p>
      </div>
      <EditorPanel>
        <div className="border-b border-zinc-100 px-5 py-4">
          <p className="text-sm font-medium text-zinc-900">새 일정</p>
        </div>
        <ScheduleForm />
      </EditorPanel>
    </div>
  );
}
