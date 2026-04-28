export default function DashboardPage() {
  return (
    <div className="flex h-full gap-4 p-6">
      {/* 왼쪽 7 */}
      <div className="flex flex-[7] flex-col gap-4">
        {/* Welcome 영역 */}
        <div className="h-20 rounded-2xl border border-zinc-100 bg-white" />

        {/* 캘린더 영역 */}
        <div className="flex-1 rounded-2xl border border-zinc-100 bg-white" />
      </div>

      {/* 오른쪽 3 */}
      <div className="flex flex-[3] flex-col gap-4">
        {/* 날씨 슬롯 */}
        <div className="flex-1 rounded-2xl border border-zinc-100 bg-white" />

        {/* 커스텀 슬롯 1 */}
        <div className="flex-1 rounded-2xl border border-zinc-100 bg-white" />

        {/* 커스텀 슬롯 2 */}
        <div className="flex-1 rounded-2xl border border-zinc-100 bg-white" />
      </div>
    </div>
  );
}
