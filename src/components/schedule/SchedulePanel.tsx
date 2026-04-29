"use client";

import { useMemo } from "react";
import Link from "next/link";
import { CalendarDays, Plus } from "lucide-react";
import ContextPanel from "@/components/layout/ContextPanel";
import type { Schedule } from "@/types/schedule";

interface SchedulePanelProps {
  schedules: Schedule[];
  activeDate: string | null;
}

type GroupKey = "오늘" | "이번 주" | "다음 주" | "이후" | "지난 일정";

const GROUP_ORDER: GroupKey[] = ["오늘", "이번 주", "다음 주", "이후", "지난 일정"];

function toLocalDateStr(isoStr: string): string {
  return isoStr.slice(0, 10);
}

function formatDisplayDate(dateStr: string): string {
  const parts = dateStr.split("-").map(Number) as [number, number, number];
  const date = new Date(parts[0], parts[1] - 1, parts[2]);
  return date.toLocaleDateString("ko-KR", {
    month: "long",
    day: "numeric",
    weekday: "short",
  });
}

function classifyDate(dateStr: string): GroupKey {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const parts = dateStr.split("-").map(Number) as [number, number, number];
  const target = new Date(parts[0], parts[1] - 1, parts[2]);

  const diffDays = Math.round(
    (target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24),
  );

  if (diffDays < 0) return "지난 일정";
  if (diffDays === 0) return "오늘";

  const dayOfWeek = today.getDay();
  const daysUntilSat = dayOfWeek === 6 ? 0 : 6 - dayOfWeek;

  if (diffDays <= daysUntilSat) return "이번 주";
  if (diffDays <= daysUntilSat + 7) return "다음 주";
  return "이후";
}

export default function SchedulePanel({ schedules, activeDate }: SchedulePanelProps) {
  const grouped = useMemo(() => {
    const dateCounts = new Map<string, number>();
    for (const s of schedules) {
      const startDate = toLocalDateStr(s.start_at);
      dateCounts.set(startDate, (dateCounts.get(startDate) ?? 0) + 1);
      if (s.end_at) {
        const endDate = toLocalDateStr(s.end_at);
        if (endDate !== startDate) {
          dateCounts.set(endDate, (dateCounts.get(endDate) ?? 0) + 1);
        }
      }
    }

    const groups = new Map<GroupKey, string[]>();
    for (const date of dateCounts.keys()) {
      const key = classifyDate(date);
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key)!.push(date);
    }

    for (const dates of groups.values()) {
      dates.sort();
    }

    return { groups, dateCounts };
  }, [schedules]);

  const hasAny = schedules.length > 0;

  return (
    <ContextPanel
      title="일정"
      action={
        <Link
          href="/dashboard/schedule"
          className="flex size-6 items-center justify-center rounded-md text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700"
        >
          <Plus size={14} strokeWidth={2} />
        </Link>
      }
    >
      <div className="flex flex-col py-2">
        {!hasAny && (
          <p className="px-4 py-8 text-center text-sm text-zinc-300">
            등록된 일정이 없습니다
          </p>
        )}

        {GROUP_ORDER.map((groupKey) => {
          const dates = grouped.groups.get(groupKey);
          if (!dates || dates.length === 0) return null;

          return (
            <div key={groupKey}>
              <p className="px-4 pb-1 pt-3 text-xs font-semibold tracking-wide text-zinc-400">
                {groupKey}
              </p>
              {dates.map((date) => {
                const count = grouped.dateCounts.get(date) ?? 0;
                const isActive = activeDate === date;
                return (
                  <Link
                    key={date}
                    href={`/dashboard/schedule/${date}`}
                    className={`flex items-center justify-between px-4 py-2.5 transition-colors hover:bg-zinc-50 ${
                      isActive ? "bg-zinc-50" : ""
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <CalendarDays
                        size={14}
                        strokeWidth={1.5}
                        className="shrink-0 text-zinc-400"
                      />
                      <span
                        className={`text-sm ${
                          isActive ? "font-medium text-zinc-900" : "text-zinc-600"
                        }`}
                      >
                        {formatDisplayDate(date)}
                      </span>
                    </div>
                    <span className="text-xs text-zinc-400">{count}</span>
                  </Link>
                );
              })}
            </div>
          );
        })}
      </div>
    </ContextPanel>
  );
}
