"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { toTimeRange, findConflicts } from "@/lib/scheduleConflict";
import type { Schedule } from "@/types/schedule";

interface ScheduleFormProps {
  initialDate?: string;
}

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

function nextDay(dateStr: string): string {
  const parts = dateStr.split("-").map(Number) as [number, number, number];
  const next = new Date(Date.UTC(parts[0], parts[1] - 1, parts[2] + 1));
  return next.toISOString().slice(0, 10);
}

export default function ScheduleForm({ initialDate }: ScheduleFormProps) {
  const router = useRouter();
  const [date, setDate] = useState(initialDate ?? today());
  const [title, setTitle] = useState("");
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("");
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [conflicts, setConflicts] = useState<Schedule[]>([]);
  const [pendingInsert, setPendingInsert] = useState(false);

  async function checkAndSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || saving) return;

    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const endDate = endTime && endTime < startTime ? nextDay(date) : date;
    const newStart = `${date}T${startTime}:00`;
    const newEnd = endTime ? `${endDate}T${endTime}:00` : null;

    const { data: existing } = await supabase
      .from("schedules")
      .select("*")
      .eq("user_id", user.id)
      .lt("start_at", `${nextDay(date)}T00:00:00`)
      .gte("start_at", `${date}T00:00:00`);

    const newRange = toTimeRange({ id: "__new__", title: title.trim(), start_at: newStart, end_at: newEnd });
    const existingRanges = (existing ?? []).map(toTimeRange);
    const found = findConflicts(newRange, existingRanges);

    if (found.length > 0) {
      setConflicts((existing ?? []).filter((s) => found.some((f) => f.id === s.id)));
      setPendingInsert(true);
      return;
    }

    await doInsert(user.id, newStart, newEnd);
  }

  async function doInsert(userId: string, newStart: string, newEnd: string | null) {
    setSaving(true);
    const supabase = createClient();
    await supabase.from("schedules").insert({
      user_id: userId,
      title: title.trim(),
      description: description.trim() || null,
      location: location.trim() || null,
      start_at: newStart,
      end_at: newEnd,
    });
    setTitle("");
    setEndTime("");
    setDescription("");
    setLocation("");
    setConflicts([]);
    setPendingInsert(false);
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
    router.push(`/dashboard/schedule/${date}`);
  }

  async function handleForceInsert() {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const endDate = endTime && endTime < startTime ? nextDay(date) : date;
    await doInsert(user.id, `${date}T${startTime}:00`, endTime ? `${endDate}T${endTime}:00` : null);
  }

  return (
    <form onSubmit={checkAndSubmit} className="flex flex-col gap-4 overflow-y-auto px-5 py-5">
      {/* 겹침 경고 */}
      {pendingInsert && conflicts.length > 0 && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3">
          <p className="text-xs font-semibold text-amber-700">겹치는 일정이 있어요</p>
          <ul className="mt-1 space-y-0.5">
            {conflicts.map((c) => (
              <li key={c.id} className="text-xs text-amber-600">
                · {c.title} ({c.start_at.slice(11, 16)}{c.end_at ? ` ~ ${c.end_at.slice(11, 16)}` : ""})
              </li>
            ))}
          </ul>
          <div className="mt-3 flex gap-2">
            <button
              type="button"
              onClick={() => { setConflicts([]); setPendingInsert(false); }}
              className="flex-1 rounded-lg border border-zinc-200 py-1.5 text-xs text-zinc-600 hover:bg-zinc-50"
            >
              취소
            </button>
            <button
              type="button"
              onClick={handleForceInsert}
              className="flex-1 rounded-lg bg-amber-500 py-1.5 text-xs font-medium text-white hover:bg-amber-600"
            >
              그래도 저장
            </button>
          </div>
        </div>
      )}

      <div className="flex flex-col gap-1">
        <label htmlFor="s-date" className="text-xs text-zinc-500">날짜</label>
        <input id="s-date" type="date" value={date} onChange={(e) => setDate(e.target.value)} required
          className="rounded-lg border border-zinc-200 px-3 py-2 text-sm text-zinc-900 outline-none focus:ring-1 focus:ring-zinc-300" />
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="s-title" className="text-xs text-zinc-500">제목 <span className="text-zinc-300">*</span></label>
        <input id="s-title" type="text" value={title} onChange={(e) => setTitle(e.target.value)}
          placeholder="일정 제목" required
          className="rounded-lg border border-zinc-200 px-3 py-2 text-sm text-zinc-900 outline-none focus:ring-1 focus:ring-zinc-300" />
      </div>

      <div className="flex gap-3">
        <div className="flex flex-1 flex-col gap-1">
          <label htmlFor="s-start" className="text-xs text-zinc-500">시작</label>
          <input id="s-start" type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)}
            className="rounded-lg border border-zinc-200 px-3 py-2 text-sm text-zinc-900 outline-none focus:ring-1 focus:ring-zinc-300" />
        </div>
        <div className="flex flex-1 flex-col gap-1">
          <label htmlFor="s-end" className="text-xs text-zinc-500">종료 <span className="text-zinc-300">(선택)</span></label>
          <input id="s-end" type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)}
            className="rounded-lg border border-zinc-200 px-3 py-2 text-sm text-zinc-900 outline-none focus:ring-1 focus:ring-zinc-300" />
        </div>
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="s-location" className="text-xs text-zinc-500">장소 <span className="text-zinc-300">(선택)</span></label>
        <input id="s-location" type="text" value={location} onChange={(e) => setLocation(e.target.value)}
          placeholder="어디서?"
          className="rounded-lg border border-zinc-200 px-3 py-2 text-sm text-zinc-900 outline-none focus:ring-1 focus:ring-zinc-300" />
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="s-desc" className="text-xs text-zinc-500">메모 <span className="text-zinc-300">(선택)</span></label>
        <textarea id="s-desc" value={description} onChange={(e) => setDescription(e.target.value)}
          placeholder="추가 메모" rows={3}
          className="resize-none rounded-lg border border-zinc-200 px-3 py-2 text-sm text-zinc-900 outline-none focus:ring-1 focus:ring-zinc-300" />
      </div>

      <button type="submit" disabled={!title.trim() || saving || pendingInsert}
        className="rounded-lg bg-zinc-900 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-700 disabled:opacity-40">
        {saving ? "저장 중..." : saved ? "저장됨 ✓" : "일정 추가"}
      </button>
    </form>
  );
}
