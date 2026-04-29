"use client";

import { useEffect, useRef, useState } from "react";
import type { Schedule } from "@/types/schedule";
import { getScheduleColor } from "@/lib/scheduleColor";
import { toTimeRange, hasAnyConflict, getConflictingIds } from "@/lib/scheduleConflict";
import ScheduleModal from "./ScheduleModal";

interface ScheduleTimelineProps {
  schedules: Schedule[];
  date: string;
}

const HOUR_HEIGHT = 64;
const MIN_BLOCK_HEIGHT = 32;

function parseMinutes(isoStr: string): number {
  const h = parseInt(isoStr.slice(11, 13), 10);
  const m = parseInt(isoStr.slice(14, 16), 10);
  return h * 60 + m;
}

function formatTime(isoStr: string): string {
  return isoStr.slice(11, 16);
}

function minutesToPx(minutes: number): number {
  return (minutes / 60) * HOUR_HEIGHT;
}

export default function ScheduleTimeline({ schedules, date }: ScheduleTimelineProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [selected, setSelected] = useState<Schedule | null>(null);

  const ranges = schedules.map(toTimeRange);
  const conflicting = getConflictingIds(ranges);
  const hasConflict = hasAnyConflict(ranges);

  useEffect(() => {
    if (!scrollRef.current) return;
    if (schedules.length > 0 && schedules[0]) {
      const startDate = schedules[0].start_at.slice(0, 10);
      const startMin = startDate < date ? 0 : parseMinutes(schedules[0].start_at);
      const scrollTo = Math.max(0, minutesToPx(startMin) - HOUR_HEIGHT * 2);
      scrollRef.current.scrollTop = scrollTo;
    } else {
      const now = new Date();
      const currentMinutes = now.getHours() * 60 + now.getMinutes();
      scrollRef.current.scrollTop = Math.max(0, minutesToPx(currentMinutes) - HOUR_HEIGHT * 2);
    }
  }, [schedules, date]);

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      {hasConflict && (
        <div className="mx-4 mb-2 flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2">
          <span className="text-sm">⚠️</span>
          <p className="text-xs font-medium text-amber-700">겹치는 일정이 있습니다</p>
        </div>
      )}
      <div ref={scrollRef} className="flex-1 overflow-y-auto">
        <div className="relative ml-14" style={{ height: HOUR_HEIGHT * 24 }}>
          {/* 시간 눈금선 + 레이블 */}
          {Array.from({ length: 24 }, (_, h) => (
            <div
              key={h}
              className="absolute left-0 right-0 flex items-start"
              style={{ top: h * HOUR_HEIGHT }}
            >
              <span className="absolute -left-14 w-12 pr-2 text-right text-xs text-zinc-500">
                {String(h).padStart(2, "0")}:00
              </span>
              <div className="w-full border-t border-zinc-100" />
            </div>
          ))}

          {/* 일정 블록 */}
          {schedules.map((schedule) => {
            const color = getScheduleColor(schedule.id);

            const startDate = schedule.start_at.slice(0, 10);
            const startMin = startDate < date ? 0 : parseMinutes(schedule.start_at);

            const endMin = schedule.end_at
              ? (schedule.end_at.slice(0, 10) > date ? 24 * 60 : parseMinutes(schedule.end_at))
              : startMin + 30;

            const durationMin = Math.max(endMin - startMin, 30);
            const top = minutesToPx(startMin);
            const height = Math.max(minutesToPx(durationMin), MIN_BLOCK_HEIGHT);

            return (
              <button
                key={schedule.id}
                onClick={() => setSelected(schedule)}
                className={`absolute left-2 right-2 overflow-hidden rounded-r-lg border-l-2 px-3 py-2 text-left transition-colors ${color.border} ${color.bg} ${color.hover} ${conflicting.has(schedule.id) ? "ring-1 ring-amber-400" : ""}`}
                style={{ top, height }}
              >
                <p className="truncate text-xs font-semibold text-zinc-900">
                  {startDate < date && (
                    <span className={`mr-1 text-xs ${color.text}`}>↓</span>
                  )}
                  {schedule.title}
                </p>
                <p className="mt-0.5 text-xs text-zinc-500">
                  {startDate < date ? "00:00" : formatTime(schedule.start_at)}
                  {schedule.end_at && ` ~ ${schedule.end_at.slice(0, 10) > date ? "24:00" : formatTime(schedule.end_at)}`}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {selected && (
        <ScheduleModal
          schedule={selected}
          onClose={() => setSelected(null)}
        />
      )}
    </div>
  );
}
