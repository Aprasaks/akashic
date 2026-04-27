import ContextPanel from "@/components/layout/ContextPanel";

export default function FinancePanel() {
  return (
    <ContextPanel title="돈">
      <div className="flex flex-1 items-center justify-center p-4">
        <p className="text-xs text-zinc-300">내역이 없습니다</p>
      </div>
    </ContextPanel>
  );
}
