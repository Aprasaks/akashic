"use client";

import { useEffect, useState } from "react";
import { Footprints, Flame } from "lucide-react";
import ContextPanel from "@/components/layout/ContextPanel";
import type { HealthSteps } from "@/types/health";

function today(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
}

function currentMonth(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}

const GOAL_STEPS = 10000;

export default function HealthPanel() {
  const [records, setRecords] = useState<HealthSteps[]>([]);

  useEffect(() => {
    fetch(`/api/health/steps?month=${currentMonth()}`)
      .then(async (res) => {
        if (res.ok) setRecords((await res.json()) as HealthSteps[]);
      })
      .catch(() => {});
  }, []);

  const todayRecord = records.find((r) => r.date === today());
  const recentRecords = records.slice(0, 7);

  return (
    <ContextPanel title="건강">
      {records.length === 0 ? (
        <div className="flex flex-1 items-center justify-center p-4">
          <p className="text-xs text-zinc-300">기록이 없습니다</p>
        </div>
      ) : (
        <div className="p-3 space-y-3">
          {/* Today */}
          {todayRecord && (
            <div className="rounded-xl bg-zinc-50 p-3">
              <p className="mb-2 text-xs font-medium text-zinc-400">오늘</p>
              <div className="flex items-end justify-between">
                <div className="flex items-center gap-1.5">
                  <Footprints size={14} className="text-zinc-500" />
                  <span className="text-base font-bold text-zinc-900">
                    {todayRecord.steps.toLocaleString()}
                  </span>
                  <span className="text-xs text-zinc-400">보</span>
                </div>
                {todayRecord.calories_burned != null && (
                  <div className="flex items-center gap-1">
                    <Flame size={12} className="text-orange-400" />
                    <span className="text-xs font-semibold text-orange-500">
                      {todayRecord.calories_burned} kcal
                    </span>
                  </div>
                )}
              </div>
              <div className="mt-2 h-1.5 w-full rounded-full bg-zinc-200">
                <div
                  className="h-1.5 rounded-full bg-zinc-800 transition-all"
                  style={{ width: `${Math.min(100, (todayRecord.steps / GOAL_STEPS) * 100)}%` }}
                />
              </div>
              <p className="mt-1 text-right text-xs text-zinc-400">
                목표 {Math.min(100, Math.round((todayRecord.steps / GOAL_STEPS) * 100))}%
              </p>
            </div>
          )}

          {/* Recent */}
          <div>
            <p className="mb-2 px-1 text-xs font-medium text-zinc-400">최근 기록</p>
            {recentRecords.map((r) => (
              <div key={r.id} className="flex items-center justify-between px-1 py-1.5">
                <span className="text-xs text-zinc-500">{r.date.slice(5).replace("-", "/")}</span>
                <div className="flex items-center gap-2">
                  <div className="h-1 w-16 rounded-full bg-zinc-100">
                    <div
                      className="h-1 rounded-full bg-zinc-600"
                      style={{ width: `${Math.min(100, (r.steps / GOAL_STEPS) * 100)}%` }}
                    />
                  </div>
                  <span className="w-14 text-right text-xs font-medium text-zinc-700">
                    {r.steps.toLocaleString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </ContextPanel>
  );
}
