"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { X, Pencil, Trash2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { getScheduleColor } from "@/lib/scheduleColor";
import type { Schedule } from "@/types/schedule";

interface ScheduleModalProps {
  schedule: Schedule;
  onClose: () => void;
}

function formatDateTime(isoStr: string): string {
  return isoStr.slice(11, 16);
}

function formatDate(isoStr: string): string {
  const parts = isoStr.slice(0, 10).split("-").map(Number) as [number, number, number];
  return new Date(parts[0], parts[1] - 1, parts[2]).toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
    weekday: "short",
  });
}

export default function ScheduleModal({ schedule, onClose }: ScheduleModalProps) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [saving, setSaving] = useState(false);

  const [title, setTitle] = useState(schedule.title);
  const [startTime, setStartTime] = useState(schedule.start_at.slice(11, 16));
  const [endTime, setEndTime] = useState(schedule.end_at ? schedule.end_at.slice(11, 16) : "");
  const [location, setLocation] = useState(schedule.location ?? "");
  const [description, setDescription] = useState(schedule.description ?? "");

  const date = schedule.start_at.slice(0, 10);
  const color = getScheduleColor(schedule.id);

  function nextDay(dateStr: string): string {
    const parts = dateStr.split("-").map(Number) as [number, number, number];
    const next = new Date(Date.UTC(parts[0], parts[1] - 1, parts[2] + 1));
    return next.toISOString().slice(0, 10);
  }

  async function handleSave() {
    if (!title.trim() || saving) return;
    setSaving(true);
    const supabase = createClient();
    await supabase
      .from("schedules")
      .update({
        title: title.trim(),
        start_at: `${date}T${startTime}:00`,
        end_at: endTime ? `${endTime < startTime ? nextDay(date) : date}T${endTime}:00` : null,
        location: location.trim() || null,
        description: description.trim() || null,
      })
      .eq("id", schedule.id);

    setSaving(false);
    router.refresh();
    onClose();
  }

  async function handleDelete() {
    setDeleting(true);
    const supabase = createClient();
    await supabase.from("schedules").delete().eq("id", schedule.id);
    router.refresh();
    onClose();
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/30"
      onClick={onClose}
    >
      <div
        className="w-96 rounded-2xl bg-white shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 헤더 */}
        <div className="flex items-center justify-between border-b border-zinc-100 px-5 py-4">
          <div className="flex items-center gap-2">
            <div className={`size-2.5 rounded-full ${color.dot}`} />
            <span className="text-xs text-zinc-400">{formatDate(schedule.start_at)}</span>
          </div>
          <div className="flex items-center gap-1">
            {!editing && (
              <button
                onClick={() => setEditing(true)}
                className="flex size-7 items-center justify-center rounded-lg text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700"
              >
                <Pencil size={14} />
              </button>
            )}
            <button
              onClick={() => setConfirmDelete(true)}
              className="flex size-7 items-center justify-center rounded-lg text-zinc-400 hover:bg-red-50 hover:text-red-400"
            >
              <Trash2 size={14} />
            </button>
            <button
              onClick={onClose}
              className="flex size-7 items-center justify-center rounded-lg text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700"
            >
              <X size={14} />
            </button>
          </div>
        </div>

        {/* 본문 */}
        <div className="flex flex-col gap-4 px-5 py-5">
          {editing ? (
            <>
              <div className="flex flex-col gap-1">
                <label className="text-xs text-zinc-500">제목</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="rounded-lg border border-zinc-200 px-3 py-2 text-sm text-zinc-900 outline-none focus:ring-1 focus:ring-zinc-300"
                />
              </div>
              <div className="flex gap-3">
                <div className="flex flex-1 flex-col gap-1">
                  <label className="text-xs text-zinc-500">시작</label>
                  <input
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="rounded-lg border border-zinc-200 px-3 py-2 text-sm text-zinc-900 outline-none focus:ring-1 focus:ring-zinc-300"
                  />
                </div>
                <div className="flex flex-1 flex-col gap-1">
                  <label className="text-xs text-zinc-500">종료</label>
                  <input
                    type="time"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="rounded-lg border border-zinc-200 px-3 py-2 text-sm text-zinc-900 outline-none focus:ring-1 focus:ring-zinc-300"
                  />
                </div>
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs text-zinc-500">장소</label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="어디서?"
                  className="rounded-lg border border-zinc-200 px-3 py-2 text-sm text-zinc-900 outline-none focus:ring-1 focus:ring-zinc-300"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs text-zinc-500">메모</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  className="resize-none rounded-lg border border-zinc-200 px-3 py-2 text-sm text-zinc-900 outline-none focus:ring-1 focus:ring-zinc-300"
                />
              </div>
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setEditing(false)}
                  className="rounded-lg px-4 py-2 text-sm text-zinc-500 hover:bg-zinc-50"
                >
                  취소
                </button>
                <button
                  onClick={handleSave}
                  disabled={!title.trim() || saving}
                  className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700 disabled:opacity-40"
                >
                  {saving ? "저장 중..." : "저장"}
                </button>
              </div>
            </>
          ) : (
            <>
              <p className="text-base font-semibold text-zinc-900">{schedule.title}</p>
              <p className="text-sm text-zinc-500">
                {formatDateTime(schedule.start_at)}
                {schedule.end_at && ` ~ ${formatDateTime(schedule.end_at)}`}
              </p>
              {schedule.location && (
                <p className="text-sm text-zinc-500">📍 {schedule.location}</p>
              )}
              {schedule.description && (
                <p className="text-sm leading-relaxed text-zinc-600">{schedule.description}</p>
              )}
            </>
          )}
        </div>

        {/* 삭제 확인 */}
        {confirmDelete && (
          <div className="border-t border-zinc-100 px-5 py-4">
            <p className="text-sm text-zinc-600">정말 삭제할까요? 되돌릴 수 없어요.</p>
            <div className="mt-3 flex justify-end gap-2">
              <button
                onClick={() => setConfirmDelete(false)}
                className="rounded-lg px-4 py-2 text-sm text-zinc-500 hover:bg-zinc-50"
              >
                취소
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="rounded-lg bg-red-500 px-4 py-2 text-sm font-medium text-white hover:bg-red-600 disabled:opacity-40"
              >
                {deleting ? "삭제 중..." : "삭제"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
