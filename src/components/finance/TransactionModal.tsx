"use client";

import { useState } from "react";
import { X, Trash2 } from "lucide-react";
import type { Transaction, FinanceCategory } from "@/types/finance";

interface TransactionModalProps {
  transaction: Transaction;
  categories: FinanceCategory[];
  onClose: () => void;
  onUpdated: (updated: Transaction) => void;
  onDeleted: (id: string) => void;
}

const PAYMENT_METHODS = [
  { value: "card", label: "카드" },
  { value: "cash", label: "현금" },
  { value: "transfer", label: "이체" },
  { value: "other", label: "기타" },
] as const;

export default function TransactionModal({
  transaction,
  categories,
  onClose,
  onUpdated,
  onDeleted,
}: TransactionModalProps) {
  const [type, setType] = useState<"income" | "expense">(transaction.type);
  const [amount, setAmount] = useState(String(transaction.amount));
  const [merchant, setMerchant] = useState(transaction.merchant ?? "");
  const [categoryId, setCategoryId] = useState(transaction.category_id ?? "");
  const [payment, setPayment] = useState(transaction.payment_method ?? "");
  const [date, setDate] = useState(transaction.date);
  const [note, setNote] = useState(transaction.note ?? "");
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const catsFor = (t: "income" | "expense") => categories.filter((c) => c.type === t);

  async function handleSave() {
    setSaving(true);
    try {
      const res = await fetch(`/api/finance/transactions/${transaction.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type,
          amount: parseInt(amount, 10) || 0,
          merchant: merchant || null,
          category_id: categoryId || null,
          payment_method: payment || null,
          date,
          note: note || null,
        }),
      });
      if (res.ok) {
        onUpdated((await res.json()) as Transaction);
        onClose();
      }
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    setDeleting(true);
    try {
      await fetch(`/api/finance/transactions/${transaction.id}`, { method: "DELETE" });
      onDeleted(transaction.id);
      onClose();
    } finally {
      setDeleting(false);
    }
  }

  const inputClass =
    "w-full rounded border border-zinc-200 px-3 py-1.5 text-sm text-zinc-900 placeholder:text-zinc-300 focus:border-zinc-400 focus:outline-none";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-96 rounded-xl bg-white shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-100 px-5 py-4">
          <p className="text-sm font-semibold text-zinc-900">거래 편집</p>
          <button
            onClick={onClose}
            className="rounded p-1 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700"
          >
            <X size={15} />
          </button>
        </div>

        {/* Form */}
        <div className="flex flex-col gap-3 p-5">
          {/* Type toggle */}
          <div className="flex overflow-hidden rounded-lg border border-zinc-200">
            {(["expense", "income"] as const).map((t) => (
              <button
                key={t}
                onClick={() => {
                  setType(t);
                  setCategoryId(catsFor(t)[0]?.id ?? "");
                }}
                className={`flex-1 py-1.5 text-xs font-medium transition-colors ${
                  type === t
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

          <div>
            <label className="mb-1 block text-xs text-zinc-400">금액</label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className={inputClass}
            />
          </div>
          <div>
            <label className="mb-1 block text-xs text-zinc-400">가맹점</label>
            <input
              type="text"
              value={merchant}
              onChange={(e) => setMerchant(e.target.value)}
              placeholder="선택사항"
              className={inputClass}
            />
          </div>
          <div>
            <label className="mb-1 block text-xs text-zinc-400">카테고리</label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className={inputClass}
            >
              <option value="">선택 안함</option>
              {catsFor(type).map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-xs text-zinc-400">결제 수단</label>
            <select
              value={payment}
              onChange={(e) => setPayment(e.target.value)}
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
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className={inputClass}
            />
          </div>
          <div>
            <label className="mb-1 block text-xs text-zinc-400">메모</label>
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="선택사항"
              className={inputClass}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-zinc-100 px-5 py-4">
          {confirmDelete ? (
            <div className="flex items-center gap-2">
              <span className="text-xs text-zinc-500">정말 삭제할까요?</span>
              <button
                onClick={() => { void handleDelete(); }}
                disabled={deleting}
                className="rounded px-2.5 py-1 text-xs font-medium text-rose-500 hover:bg-rose-50 disabled:opacity-40"
              >
                {deleting ? "삭제 중..." : "삭제"}
              </button>
              <button
                onClick={() => setConfirmDelete(false)}
                className="rounded px-2.5 py-1 text-xs text-zinc-400 hover:bg-zinc-100"
              >
                취소
              </button>
            </div>
          ) : (
            <button
              onClick={() => setConfirmDelete(true)}
              className="flex items-center gap-1 rounded p-1.5 text-zinc-300 hover:bg-rose-50 hover:text-rose-400"
            >
              <Trash2 size={14} />
            </button>
          )}
          <button
            onClick={() => { void handleSave(); }}
            disabled={saving}
            className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700 disabled:opacity-40"
          >
            {saving ? "저장 중..." : "저장"}
          </button>
        </div>
      </div>
    </div>
  );
}
