"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

interface ScheduleFormProps {
  initialDate?: string;
}

function today(): string {
  return new Date().toISOString().slice(0, 10);
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

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || saving) return;
    setSaving(true);

    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) { setSaving(false); return; }

    await supabase.from("schedules").insert({
      user_id: user.id,
      title: title.trim(),
      description: description.trim() || null,
      location: location.trim() || null,
      start_at: `${date}T${startTime}:00`,
      end_at: endTime ? `${date}T${endTime}:00` : null,
    });

    setTitle("");
    setEndTime("");
    setDescription("");
    setLocation("");
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
    router.push(`/dashboard/schedule/${date}`);
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 overflow-y-auto px-5 py-5">
      <div className="flex flex-col gap-1">
        <label htmlFor="s-date" className="text-xs text-zinc-500">
          날짜
        </label>
        <input
          id="s-date"
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          required
          className="rounded-lg border border-zinc-200 px-3 py-2 text-sm text-zinc-900 outline-none focus:ring-1 focus:ring-zinc-300"
        />
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="s-title" className="text-xs text-zinc-500">
          제목 <span className="text-zinc-300">*</span>
        </label>
        <input
          id="s-title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="일정 제목"
          required
          className="rounded-lg border border-zinc-200 px-3 py-2 text-sm text-zinc-900 outline-none focus:ring-1 focus:ring-zinc-300"
        />
      </div>

      <div className="flex gap-3">
        <div className="flex flex-1 flex-col gap-1">
          <label htmlFor="s-start" className="text-xs text-zinc-500">
            시작
          </label>
          <input
            id="s-start"
            type="time"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            className="rounded-lg border border-zinc-200 px-3 py-2 text-sm text-zinc-900 outline-none focus:ring-1 focus:ring-zinc-300"
          />
        </div>
        <div className="flex flex-1 flex-col gap-1">
          <label htmlFor="s-end" className="text-xs text-zinc-500">
            종료 <span className="text-zinc-300">(선택)</span>
          </label>
          <input
            id="s-end"
            type="time"
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
            className="rounded-lg border border-zinc-200 px-3 py-2 text-sm text-zinc-900 outline-none focus:ring-1 focus:ring-zinc-300"
          />
        </div>
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="s-location" className="text-xs text-zinc-500">
          장소 <span className="text-zinc-300">(선택)</span>
        </label>
        <input
          id="s-location"
          type="text"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          placeholder="어디서?"
          className="rounded-lg border border-zinc-200 px-3 py-2 text-sm text-zinc-900 outline-none focus:ring-1 focus:ring-zinc-300"
        />
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="s-desc" className="text-xs text-zinc-500">
          메모 <span className="text-zinc-300">(선택)</span>
        </label>
        <textarea
          id="s-desc"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="추가 메모"
          rows={3}
          className="resize-none rounded-lg border border-zinc-200 px-3 py-2 text-sm text-zinc-900 outline-none focus:ring-1 focus:ring-zinc-300"
        />
      </div>

      <button
        type="submit"
        disabled={!title.trim() || saving}
        className="rounded-lg bg-zinc-900 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-700 disabled:opacity-40"
      >
        {saving ? "저장 중..." : saved ? "저장됨 ✓" : "일정 추가"}
      </button>
    </form>
  );
}
