"use client";

import { useState } from "react";
import { Footprints, Weight, X } from "lucide-react";

interface StepsInputFormProps {
  onSave: (steps: number, weightKg: number | null) => Promise<void>;
  onClose: () => void;
  initialSteps?: number;
  initialWeight?: number | null;
}

export default function StepsInputForm({
  onSave,
  onClose,
  initialSteps = 0,
  initialWeight = null,
}: StepsInputFormProps) {
  const [steps, setSteps] = useState(String(initialSteps || ""));
  const [weight, setWeight] = useState(String(initialWeight ?? ""));
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const s = parseInt(steps, 10);
    if (isNaN(s) || s < 0) return;
    const w = weight !== "" ? parseFloat(weight) : null;
    setSaving(true);
    try {
      await onSave(s, w);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
      <div className="w-80 rounded-2xl bg-white p-6 shadow-xl">
        <div className="mb-5 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-zinc-900">오늘 기록 입력</h3>
          <button onClick={onClose} className="text-zinc-400 hover:text-zinc-600">
            <X size={16} />
          </button>
        </div>

        <form onSubmit={(e) => { void handleSubmit(e); }} className="space-y-4">
          <div>
            <label className="mb-1.5 flex items-center gap-1.5 text-xs font-medium text-zinc-500">
              <Footprints size={13} />
              걸음수
            </label>
            <input
              type="number"
              min="0"
              max="100000"
              value={steps}
              onChange={(e) => setSteps(e.target.value)}
              placeholder="0"
              className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm text-zinc-800 outline-none focus:border-zinc-400"
            />
          </div>

          <div>
            <label className="mb-1.5 flex items-center gap-1.5 text-xs font-medium text-zinc-500">
              <Weight size={13} />
              체중 (kg)
            </label>
            <input
              type="number"
              min="20"
              max="300"
              step="0.1"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              placeholder="선택 입력"
              className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm text-zinc-800 outline-none focus:border-zinc-400"
            />
          </div>

          {steps !== "" && weight !== "" && (
            <div className="rounded-lg bg-zinc-50 px-3 py-2">
              <p className="text-xs text-zinc-500">예상 칼로리 소모</p>
              <p className="text-sm font-semibold text-zinc-800">
                {Math.round(parseInt(steps || "0", 10) * 0.04 * (parseFloat(weight) / 60) * 10) / 10} kcal
              </p>
            </div>
          )}

          <button
            type="submit"
            disabled={saving || steps === ""}
            className="w-full rounded-lg bg-zinc-900 py-2.5 text-sm font-medium text-white hover:bg-zinc-700 disabled:opacity-40"
          >
            {saving ? "저장 중..." : "저장"}
          </button>
        </form>
      </div>
    </div>
  );
}
