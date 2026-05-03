"use client";

import { useState, useEffect } from "react";
import { Footprints, Flame, ChevronLeft, ChevronRight, Plus, Weight } from "lucide-react";
import StepsInputForm from "@/components/health/StepsInputForm";
import GpsTracker from "@/components/health/GpsTracker";
import type { HealthSteps, GpsPoint } from "@/types/health";

type Tab = "기록" | "통계";

function currentMonth(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}

function shiftMonth(month: string, delta: number): string {
  const parts = month.split("-").map(Number);
  const y = parts[0] ?? 2000;
  const m = parts[1] ?? 1;
  const d = new Date(y, m - 1 + delta, 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

function getMonthLabel(month: string): string {
  const m = month.split("-")[1] ?? "1";
  return `${month.slice(0, 4)}년 ${parseInt(m)}월`;
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr + "T00:00:00");
  return `${d.getMonth() + 1}월 ${d.getDate()}일 (${["일","월","화","수","목","금","토"][d.getDay()]})`;
}

function today(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
}

const GOAL_STEPS = 10000;

export default function HealthMain() {
  const defaultMonth = currentMonth();
  const [tab, setTab] = useState<Tab>("기록");
  const [month, setMonth] = useState(defaultMonth);
  const [records, setRecords] = useState<HealthSteps[]>([]);
  const [fetched, setFetched] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [pendingRoute, setPendingRoute] = useState<{ route: GpsPoint[]; distanceM: number } | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    setFetched(false);
    fetch(`/api/health/steps?month=${month}`, { signal: controller.signal })
      .then(async (res) => {
        if (res.ok) {
          setRecords((await res.json()) as HealthSteps[]);
          setFetched(true);
        }
      })
      .catch(() => {});
    return () => controller.abort();
  }, [month]);

  function changeMonth(delta: -1 | 1) {
    setMonth((prev) => shiftMonth(prev, delta));
    setFetched(false);
  }

  async function handleSave(steps: number, weightKg: number | null) {
    const body = {
      date: today(),
      steps,
      weight_kg: weightKg,
      route: pendingRoute?.route ?? null,
      distance_m: pendingRoute?.distanceM ?? null,
    };
    const res = await fetch("/api/health/steps", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (res.ok) {
      const saved = (await res.json()) as HealthSteps;
      setRecords((prev) => {
        const idx = prev.findIndex((r) => r.date === saved.date);
        return idx >= 0 ? prev.map((r, i) => (i === idx ? saved : r)) : [saved, ...prev];
      });
    }
    setPendingRoute(null);
    setShowForm(false);
  }

  function handleRouteComplete(route: GpsPoint[], distanceM: number) {
    setPendingRoute({ route, distanceM });
    const estimatedSteps = Math.round(distanceM / 0.75);
    setShowForm(true);
    return estimatedSteps;
  }

  const todayRecord = records.find((r) => r.date === today());
  const avgSteps = records.length > 0
    ? Math.round(records.reduce((s, r) => s + r.steps, 0) / records.length)
    : 0;
  const totalCalories = records.reduce((s, r) => s + (r.calories_burned ?? 0), 0);

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      {/* Month navigation */}
      <div className="flex items-center justify-between border-b border-zinc-100 px-6 py-3">
        <button
          onClick={() => changeMonth(-1)}
          className="rounded p-1 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700"
        >
          <ChevronLeft size={16} />
        </button>
        <span className="text-sm font-medium text-zinc-800">{getMonthLabel(month)}</span>
        <button
          onClick={() => changeMonth(1)}
          disabled={month >= defaultMonth}
          className="rounded p-1 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700 disabled:opacity-30"
        >
          <ChevronRight size={16} />
        </button>
      </div>

      {/* Today summary */}
      <div className="flex items-center gap-4 border-b border-zinc-100 px-6 py-3">
        <div className="flex items-center gap-1.5">
          <Footprints size={13} className="text-zinc-500" />
          <span className="text-xs text-zinc-400">오늘</span>
          <span className="text-xs font-semibold text-zinc-800">
            {todayRecord ? todayRecord.steps.toLocaleString() : "—"} 보
          </span>
        </div>
        <div className="h-3 w-px bg-zinc-200" />
        <div className="flex items-center gap-1.5">
          <Flame size={13} className="text-orange-400" />
          <span className="text-xs font-semibold text-orange-500">
            {todayRecord?.calories_burned != null ? `${todayRecord.calories_burned} kcal` : "—"}
          </span>
        </div>
        {todayRecord?.weight_kg != null && (
          <>
            <div className="h-3 w-px bg-zinc-200" />
            <div className="flex items-center gap-1.5">
              <Weight size={13} className="text-zinc-400" />
              <span className="text-xs font-semibold text-zinc-700">{todayRecord.weight_kg} kg</span>
            </div>
          </>
        )}
        <button
          onClick={() => setShowForm(true)}
          className="ml-auto flex items-center gap-1 rounded-lg bg-zinc-900 px-2.5 py-1 text-xs font-medium text-white hover:bg-zinc-700"
        >
          <Plus size={11} />
          입력
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-zinc-100 px-6">
        {(["기록", "통계"] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`border-b-2 px-3 py-2.5 text-xs font-medium transition-colors ${
              tab === t
                ? "border-zinc-800 text-zinc-900"
                : "border-transparent text-zinc-400 hover:text-zinc-600"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {tab === "기록" && (
          <div>
            {/* GPS Tracker */}
            <div className="border-b border-zinc-100 px-6 py-4">
              <GpsTracker onRouteComplete={handleRouteComplete} />
            </div>

            {!fetched ? (
              <div className="flex items-center justify-center py-16">
                <div className="size-5 animate-spin rounded-full border-2 border-zinc-200 border-t-zinc-500" />
              </div>
            ) : records.length === 0 ? (
              <p className="py-16 text-center text-sm text-zinc-300">기록이 없습니다</p>
            ) : (
              records.map((r) => {
                const pct = Math.min(100, Math.round((r.steps / GOAL_STEPS) * 100));
                return (
                  <div key={r.id} className="border-b border-zinc-50 px-6 py-3">
                    <div className="mb-2 flex items-center justify-between">
                      <p className="text-xs font-semibold text-zinc-500">{formatDate(r.date)}</p>
                      <div className="flex items-center gap-3">
                        {r.weight_kg != null && (
                          <span className="text-xs text-zinc-400">{r.weight_kg} kg</span>
                        )}
                        {r.calories_burned != null && (
                          <span className="flex items-center gap-1 text-xs text-orange-500">
                            <Flame size={11} />
                            {r.calories_burned} kcal
                          </span>
                        )}
                        <span className="text-sm font-bold text-zinc-800">
                          {r.steps.toLocaleString()} 보
                        </span>
                      </div>
                    </div>
                    <div className="h-1.5 w-full rounded-full bg-zinc-100">
                      <div
                        className="h-1.5 rounded-full bg-zinc-800 transition-all"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <div className="mt-1 flex justify-between">
                      <span className="text-xs text-zinc-300">0</span>
                      <span className={`text-xs font-medium ${pct >= 100 ? "text-emerald-600" : "text-zinc-400"}`}>
                        {pct}% {pct >= 100 ? "🎯" : `/ ${GOAL_STEPS.toLocaleString()}보`}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

        {tab === "통계" && (
          <div className="px-6 py-5 space-y-6">
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl bg-zinc-50 p-4">
                <p className="text-xs text-zinc-400">이번 달 평균</p>
                <p className="mt-1 text-lg font-bold text-zinc-800">{avgSteps.toLocaleString()}</p>
                <p className="text-xs text-zinc-400">걸음</p>
              </div>
              <div className="rounded-xl bg-zinc-50 p-4">
                <p className="text-xs text-zinc-400">총 칼로리</p>
                <p className="mt-1 text-lg font-bold text-orange-500">
                  {Math.round(totalCalories).toLocaleString()}
                </p>
                <p className="text-xs text-zinc-400">kcal</p>
              </div>
            </div>

            {fetched && records.length > 0 && (
              <div>
                <p className="mb-3 text-xs font-semibold text-zinc-400">일별 걸음수</p>
                <div className="space-y-2">
                  {[...records].sort((a, b) => a.date.localeCompare(b.date)).map((r) => {
                    const pct = Math.min(100, (r.steps / GOAL_STEPS) * 100);
                    return (
                      <div key={r.id} className="flex items-center gap-3">
                        <span className="w-12 shrink-0 text-xs text-zinc-400">
                          {r.date.slice(8)}일
                        </span>
                        <div className="h-2 flex-1 rounded-full bg-zinc-100">
                          <div
                            className="h-2 rounded-full bg-zinc-700 transition-all"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                        <span className="w-16 shrink-0 text-right text-xs font-medium text-zinc-600">
                          {r.steps.toLocaleString()}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {fetched && records.length === 0 && (
              <p className="py-12 text-center text-sm text-zinc-300">기록이 없습니다</p>
            )}
          </div>
        )}
      </div>

      {showForm && (
        <StepsInputForm
          onSave={handleSave}
          onClose={() => { setShowForm(false); setPendingRoute(null); }}
          initialSteps={pendingRoute ? Math.round((pendingRoute.distanceM) / 0.75) : 0}
        />
      )}
    </div>
  );
}
