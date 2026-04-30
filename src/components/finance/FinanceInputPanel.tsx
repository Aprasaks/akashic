"use client";

import { useState } from "react";
import { Bot, PenLine, CheckCircle2, XCircle } from "lucide-react";
import type { FinanceCategory, ParsedTransaction } from "@/types/finance";

interface FinanceInputPanelProps {
  categories: FinanceCategory[];
  onSaved: () => void;
}

type InputTab = "ai" | "manual";

const PAYMENT_METHODS = [
  { value: "card", label: "카드" },
  { value: "cash", label: "현금" },
  { value: "transfer", label: "이체" },
  { value: "other", label: "기타" },
] as const;

export default function FinanceInputPanel({ categories, onSaved }: FinanceInputPanelProps) {
  const [tab, setTab] = useState<InputTab>("ai");

  // AI input state
  const [text, setText] = useState("");
  const [parsing, setParsing] = useState(false);
  const [parsed, setParsed] = useState<ParsedTransaction | null>(null);
  const [parseError, setParseError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // Editable fields after parsing
  const [editType, setEditType] = useState<"income" | "expense">("expense");
  const [editAmount, setEditAmount] = useState("");
  const [editMerchant, setEditMerchant] = useState("");
  const [editCategoryId, setEditCategoryId] = useState("");
  const [editPayment, setEditPayment] = useState("");
  const [editDate, setEditDate] = useState("");
  const [editNote, setEditNote] = useState("");

  // Manual form state
  const [manualType, setManualType] = useState<"income" | "expense">("expense");
  const [manualAmount, setManualAmount] = useState("");
  const [manualMerchant, setManualMerchant] = useState("");
  const [manualCategoryId, setManualCategoryId] = useState("");
  const [manualPayment, setManualPayment] = useState("");
  const [manualDate, setManualDate] = useState(new Date().toISOString().slice(0, 10));
  const [manualNote, setManualNote] = useState("");
  const [manualSaving, setManualSaving] = useState(false);

  function catsFor(type: "income" | "expense") {
    return categories.filter((c) => c.type === type);
  }

  function typeToggle(
    current: "income" | "expense",
    setter: (v: "income" | "expense") => void,
    onCategoryReset: () => void,
  ) {
    return (
      <div className="flex overflow-hidden rounded-lg border border-zinc-200">
        {(["expense", "income"] as const).map((t) => (
          <button
            key={t}
            onClick={() => {
              setter(t);
              onCategoryReset();
            }}
            className={`flex-1 py-1.5 text-xs font-medium transition-colors ${
              current === t
                ? t === "expense"
                  ? "bg-rose-500 text-white"
                  : "bg-emerald-500 text-white"
                : "text-zinc-400 hover:bg-zinc-50"
            }`}
          >
            {t === "expense" ? "지출" : "수입"}
          </button>
        ))}
      </div>
    );
  }

  async function handleParse() {
    if (!text.trim()) return;
    setParsing(true);
    setParseError(null);
    try {
      const res = await fetch("/api/finance/parse", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });
      if (!res.ok) throw new Error();
      const data = (await res.json()) as ParsedTransaction;
      setParsed(data);
      setEditType(data.type);
      setEditAmount(String(data.amount));
      setEditMerchant(data.merchant ?? "");
      const cats = catsFor(data.type);
      setEditCategoryId(cats.find((c) => c.name === data.category)?.id ?? cats[0]?.id ?? "");
      setEditPayment(data.payment_method ?? "");
      setEditDate(data.date);
      setEditNote(data.note ?? "");
    } catch {
      setParseError("파싱에 실패했습니다. 다시 시도해주세요.");
    } finally {
      setParsing(false);
    }
  }

  async function handleSaveAI() {
    if (!parsed) return;
    setSaving(true);
    try {
      const res = await fetch("/api/finance/transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: editType,
          amount: parseInt(editAmount, 10) || 0,
          merchant: editMerchant || null,
          category_id: editCategoryId || null,
          payment_method: editPayment || null,
          date: editDate,
          note: editNote || null,
          source: "ai",
        }),
      });
      if (res.ok) {
        setParsed(null);
        setText("");
        onSaved();
      }
    } finally {
      setSaving(false);
    }
  }

  async function handleSaveManual() {
    if (!manualAmount || !manualDate) return;
    setManualSaving(true);
    try {
      const res = await fetch("/api/finance/transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: manualType,
          amount: parseInt(manualAmount, 10) || 0,
          merchant: manualMerchant || null,
          category_id: manualCategoryId || null,
          payment_method: manualPayment || null,
          date: manualDate,
          note: manualNote || null,
          source: "manual",
        }),
      });
      if (res.ok) {
        setManualAmount("");
        setManualMerchant("");
        setManualCategoryId("");
        setManualPayment("");
        setManualDate(new Date().toISOString().slice(0, 10));
        setManualNote("");
        onSaved();
      }
    } finally {
      setManualSaving(false);
    }
  }

  const inputClass =
    "w-full rounded border border-zinc-200 px-3 py-1.5 text-sm text-zinc-900 placeholder:text-zinc-300 focus:border-zinc-400 focus:outline-none";

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      {/* Tab toggle */}
      <div className="flex border-b border-zinc-100">
        {[
          { key: "ai" as InputTab, label: "AI 입력", Icon: Bot },
          { key: "manual" as InputTab, label: "직접 입력", Icon: PenLine },
        ].map(({ key, label, Icon }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`flex flex-1 items-center justify-center gap-1.5 border-b-2 py-3 text-xs font-medium transition-colors ${
              tab === key
                ? "border-zinc-800 text-zinc-900"
                : "border-transparent text-zinc-400 hover:text-zinc-600"
            }`}
          >
            <Icon size={12} />
            {label}
          </button>
        ))}
      </div>

      {/* AI Input */}
      {tab === "ai" && (
        <div className="flex flex-1 flex-col gap-4 overflow-y-auto p-5">
          {!parsed ? (
            <>
              <p className="text-xs text-zinc-400">
                자연어로 거래를 입력하면 AI가 자동으로 분류합니다
              </p>
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder={"예) 피시방에서 8500원 카드결제했어\n점심 7000원 현금으로 냈어"}
                className="min-h-28 resize-none rounded-lg border border-zinc-200 p-3 text-sm text-zinc-900 placeholder:text-zinc-300 focus:border-zinc-400 focus:outline-none"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
                    void handleParse();
                  }
                }}
              />
              {parseError && <p className="text-xs text-rose-500">{parseError}</p>}
              <button
                onClick={() => { void handleParse(); }}
                disabled={!text.trim() || parsing}
                className="rounded-lg bg-zinc-900 py-2.5 text-sm font-medium text-white hover:bg-zinc-700 disabled:opacity-40"
              >
                {parsing ? "분석 중..." : "파싱하기  ⌘↵"}
              </button>
            </>
          ) : (
            <div className="flex flex-1 flex-col gap-3">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold text-zinc-500">확인 및 수정</p>
                <span
                  className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                    parsed.confidence >= 0.8
                      ? "bg-emerald-100 text-emerald-700"
                      : parsed.confidence >= 0.5
                        ? "bg-amber-100 text-amber-700"
                        : "bg-rose-100 text-rose-700"
                  }`}
                >
                  {Math.round(parsed.confidence * 100)}% 확신
                </span>
              </div>

              {typeToggle(editType, setEditType, () =>
                setEditCategoryId(catsFor(editType === "expense" ? "income" : "expense")[0]?.id ?? ""),
              )}

              <div>
                <label className="mb-1 block text-xs text-zinc-400">금액</label>
                <input
                  type="number"
                  value={editAmount}
                  onChange={(e) => setEditAmount(e.target.value)}
                  className={inputClass}
                />
              </div>
              <div>
                <label className="mb-1 block text-xs text-zinc-400">가맹점</label>
                <input
                  type="text"
                  value={editMerchant}
                  onChange={(e) => setEditMerchant(e.target.value)}
                  placeholder="선택사항"
                  className={inputClass}
                />
              </div>
              <div>
                <label className="mb-1 block text-xs text-zinc-400">카테고리</label>
                <select
                  value={editCategoryId}
                  onChange={(e) => setEditCategoryId(e.target.value)}
                  className={inputClass}
                >
                  <option value="">선택 안함</option>
                  {catsFor(editType).map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-xs text-zinc-400">결제 수단</label>
                <select
                  value={editPayment}
                  onChange={(e) => setEditPayment(e.target.value)}
                  className={inputClass}
                >
                  <option value="">선택 안함</option>
                  {PAYMENT_METHODS.map((pm) => (
                    <option key={pm.value} value={pm.value}>{pm.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-xs text-zinc-400">날짜</label>
                <input
                  type="date"
                  value={editDate}
                  onChange={(e) => setEditDate(e.target.value)}
                  className={inputClass}
                />
              </div>
              <div>
                <label className="mb-1 block text-xs text-zinc-400">메모</label>
                <input
                  type="text"
                  value={editNote}
                  onChange={(e) => setEditNote(e.target.value)}
                  placeholder="선택사항"
                  className={inputClass}
                />
              </div>

              <div className="mt-auto flex gap-2">
                <button
                  onClick={() => { setParsed(null); setParseError(null); }}
                  className="flex flex-1 items-center justify-center gap-1 rounded-lg border border-zinc-200 py-2 text-sm text-zinc-500 hover:bg-zinc-50"
                >
                  <XCircle size={13} />
                  취소
                </button>
                <button
                  onClick={() => { void handleSaveAI(); }}
                  disabled={saving}
                  className="flex flex-1 items-center justify-center gap-1 rounded-lg bg-zinc-900 py-2 text-sm font-medium text-white hover:bg-zinc-700 disabled:opacity-40"
                >
                  <CheckCircle2 size={13} />
                  {saving ? "저장 중..." : "저장"}
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Manual Input */}
      {tab === "manual" && (
        <div className="flex flex-1 flex-col gap-3 overflow-y-auto p-5">
          {typeToggle(manualType, setManualType, () => setManualCategoryId(""))}

          <div>
            <label className="mb-1 block text-xs text-zinc-400">금액 *</label>
            <input
              type="number"
              value={manualAmount}
              onChange={(e) => setManualAmount(e.target.value)}
              placeholder="0"
              className={inputClass}
            />
          </div>
          <div>
            <label className="mb-1 block text-xs text-zinc-400">가맹점</label>
            <input
              type="text"
              value={manualMerchant}
              onChange={(e) => setManualMerchant(e.target.value)}
              placeholder="선택사항"
              className={inputClass}
            />
          </div>
          <div>
            <label className="mb-1 block text-xs text-zinc-400">카테고리</label>
            <select
              value={manualCategoryId}
              onChange={(e) => setManualCategoryId(e.target.value)}
              className={inputClass}
            >
              <option value="">선택 안함</option>
              {catsFor(manualType).map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-xs text-zinc-400">결제 수단</label>
            <select
              value={manualPayment}
              onChange={(e) => setManualPayment(e.target.value)}
              className={inputClass}
            >
              <option value="">선택 안함</option>
              {PAYMENT_METHODS.map((pm) => (
                <option key={pm.value} value={pm.value}>{pm.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-xs text-zinc-400">날짜 *</label>
            <input
              type="date"
              value={manualDate}
              onChange={(e) => setManualDate(e.target.value)}
              className={inputClass}
            />
          </div>
          <div>
            <label className="mb-1 block text-xs text-zinc-400">메모</label>
            <textarea
              value={manualNote}
              onChange={(e) => setManualNote(e.target.value)}
              placeholder="선택사항"
              rows={2}
              className="w-full resize-none rounded border border-zinc-200 px-3 py-1.5 text-sm text-zinc-900 placeholder:text-zinc-300 focus:border-zinc-400 focus:outline-none"
            />
          </div>

          <button
            onClick={() => { void handleSaveManual(); }}
            disabled={!manualAmount || !manualDate || manualSaving}
            className="mt-2 rounded-lg bg-zinc-900 py-2.5 text-sm font-medium text-white hover:bg-zinc-700 disabled:opacity-40"
          >
            {manualSaving ? "저장 중..." : "저장하기"}
          </button>
        </div>
      )}
    </div>
  );
}
