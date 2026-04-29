import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import EditorPanel from "@/components/layout/EditorPanel";
import ScheduleForm from "@/components/schedule/ScheduleForm";
import ScheduleTimeline from "@/components/schedule/ScheduleTimeline";
import type { Schedule } from "@/types/schedule";

interface Props {
  params: Promise<{ date: string }>;
}

function formatDisplayDate(dateStr: string): string {
  const parts = dateStr.split("-").map(Number) as [number, number, number];
  return new Date(parts[0], parts[1] - 1, parts[2]).toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
    weekday: "long",
  });
}

function nextDay(dateStr: string): string {
  const parts = dateStr.split("-").map(Number) as [number, number, number];
  const next = new Date(Date.UTC(parts[0], parts[1] - 1, parts[2] + 1));
  return next.toISOString().slice(0, 10);
}

export default async function ScheduleDatePage({ params }: Props) {
  const { date } = await params;

  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) notFound();

  const supabase = await createClient();
  const { data: schedules } = await supabase
    .from("schedules")
    .select("*")
    .gte("start_at", `${date}T00:00:00`)
    .lt("start_at", `${nextDay(date)}T00:00:00`)
    .order("start_at");

  const list: Schedule[] = schedules ?? [];

  return (
    <div className="flex h-full">
      <div className="flex flex-1 flex-col overflow-hidden">
        <div className="border-b border-zinc-100 px-8 py-5">
          <p className="text-xs text-zinc-400">일정</p>
          <h1 className="mt-0.5 text-base font-semibold text-zinc-900">
            {formatDisplayDate(date)}
          </h1>
        </div>
        <div className="relative flex flex-1 overflow-hidden px-4 py-4">
          <ScheduleTimeline schedules={list} />
        </div>
      </div>

      <EditorPanel>
        <div className="border-b border-zinc-100 px-5 py-4">
          <p className="text-sm font-medium text-zinc-900">일정 추가</p>
          <p className="mt-0.5 text-xs text-zinc-400">{formatDisplayDate(date)}</p>
        </div>
        <ScheduleForm initialDate={date} />
      </EditorPanel>
    </div>
  );
}
