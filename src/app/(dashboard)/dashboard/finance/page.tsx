import EditorPanel from "@/components/layout/EditorPanel";

export default function FinancePage() {
  return (
    <div className="flex h-full">
      <div className="flex flex-1 items-center justify-center">
        <p className="text-sm text-zinc-300">내역을 선택하세요</p>
      </div>
      <EditorPanel />
    </div>
  );
}
