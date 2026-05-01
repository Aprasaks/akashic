"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { TrendingUp, TrendingDown, Sparkles, ChevronLeft, ChevronRight } from "lucide-react";
import { formatAmount, formatDate } from "@/lib/financeDefaults";
import TransactionModal from "@/components/finance/TransactionModal";
import type { Transaction, FinanceCategory } from "@/types/finance";

interface FinanceMainProps {
  categories: FinanceCategory[];
  refreshKey: number;
}

type Tab = "내역" | "통계" | "분석";
type Filter = "all" | "income" | "expense";

function getMonthLabel(month: string): string {
  const m = month.split("-")[1] ?? "1";
  return `${month.slice(0, 4)}년 ${parseInt(m)}월`;
}

function shiftMonth(month: string, delta: number): string {
  const parts = month.split("-").map(Number);
  const y = parts[0] ?? 2000;
  const m = parts[1] ?? 1;
  const d = new Date(y, m - 1 + delta, 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

function currentMonth(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}

const PAYMENT_LABEL: Record<string, string> = {
  card: "카드",
  cash: "현금",
  transfer: "이체",
  other: "기타",
};

export default function FinanceMain({ categories, refreshKey }: FinanceMainProps) {
  const router = useRouter();
  const defaultMonth = currentMonth();

  const [tab, setTab] = useState<Tab>("내역");
  const [month, setMonth] = useState(defaultMonth);
  const [filter, setFilter] = useState<Filter>("all");
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [selected, setSelected] = useState<Transaction | null>(null);

  const [fetched, setFetched] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    fetch(`/api/finance/transactions?month=${month}`, { signal: controller.signal })
      .then(async (res) => {
        if (res.ok) {
          setTransactions((await res.json()) as Transaction[]);
          setFetched(true);
        }
      })
      .catch(() => {});
    return () => controller.abort();
  }, [month, refreshKey]);

  function changeMonth(delta: -1 | 1) {
    setMonth((prev) => shiftMonth(prev, delta));
    setAnalysis(null);
    setFetched(false);
  }

  const income = transactions.filter((t) => t.type === "income").reduce((s, t) => s + t.amount, 0);
  const expense = transactions.filter((t) => t.type === "expense").reduce((s, t) => s + t.amount, 0);
  const balance = income - expense;

  const filtered = filter === "all" ? transactions : transactions.filter((t) => t.type === filter);

  const grouped = filtered.reduce<Record<string, Transaction[]>>((acc, t) => {
    (acc[t.date] ??= []).push(t);
    return acc;
  }, {});
  const sortedDates = Object.keys(grouped).sort((a, b) => b.localeCompare(a));

  const catStats = categories
    .filter((c) => c.type === "expense")
    .map((c) => ({
      ...c,
      total: transactions
        .filter((t) => t.type === "expense" && t.category?.id === c.id)
        .reduce((s, t) => s + t.amount, 0),
    }))
    .filter((c) => c.total > 0)
    .sort((a, b) => b.total - a.total);

  function handleUpdated(updated: Transaction) {
    setTransactions((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
    router.refresh();
  }

  function handleDeleted(id: string) {
    setTransactions((prev) => prev.filter((t) => t.id !== id));
    router.refresh();
  }

  async function handleAnalyze() {
    setAnalyzing(true);
    try {
      const res = await fetch("/api/finance/analyze", { method: "POST" });
      if (res.ok) {
        const data = (await res.json()) as { analysis: string };
        setAnalysis(data.analysis);
      }
    } finally {
      setAnalyzing(false);
    }
  }

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

      {/* Summary bar */}
      <div className="flex items-center gap-4 border-b border-zinc-100 px-6 py-3">
        <div className="flex items-center gap-1.5">
          <TrendingUp size={13} className="text-emerald-500" />
          <span className="text-xs text-zinc-400">수입</span>
          <span className="text-xs font-semibold text-emerald-600">{formatAmount(income)}</span>
        </div>
        <div className="h-3 w-px bg-zinc-200" />
        <div className="flex items-center gap-1.5">
          <TrendingDown size={13} className="text-rose-500" />
          <span className="text-xs text-zinc-400">지출</span>
          <span className="text-xs font-semibold text-rose-500">{formatAmount(expense)}</span>
        </div>
        <div className="h-3 w-px bg-zinc-200" />
        <div className="flex items-center gap-1.5">
          <span className="text-xs text-zinc-400">잔액</span>
          <span className={`text-xs font-bold ${balance >= 0 ? "text-zinc-800" : "text-rose-500"}`}>
            {balance < 0 ? "-" : ""}{formatAmount(Math.abs(balance))}
          </span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-zinc-100 px-6">
        {(["내역", "통계", "분석"] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`border-b-2 px-3 py-2.5 text-xs font-medium transition-colors ${
              tab === t
                ? "border-zinc-800 text-zinc-900"
                : "border-transparent text-zinc-400 hover:text-zinc-600"
            }`}
          >
            {t === "분석" ? "AI 분석" : t}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {tab === "내역" && (
          <div>
            <div className="flex gap-1 px-6 py-3">
              {(["all", "income", "expense"] as Filter[]).map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                    filter === f
                      ? "bg-zinc-900 text-white"
                      : "bg-zinc-100 text-zinc-500 hover:bg-zinc-200"
                  }`}
                >
                  {f === "all" ? "전체" : f === "income" ? "수입" : "지출"}
                </button>
              ))}
            </div>

            {!fetched ? (
              <div className="flex items-center justify-center py-16">
                <div className="size-5 animate-spin rounded-full border-2 border-zinc-200 border-t-zinc-500" />
              </div>
            ) : filtered.length === 0 ? (
              <p className="py-16 text-center text-sm text-zinc-300">내역이 없습니다</p>
            ) : (
              sortedDates.map((date) => (
                <div key={date}>
                  <p className="px-6 pb-1 pt-3 text-xs font-semibold text-zinc-400">
                    {formatDate(date)}
                  </p>
                  {(grouped[date] ?? []).map((t) => (
                    <button
                      key={t.id}
                      onClick={() => setSelected(t)}
                      className="flex w-full items-center justify-between px-6 py-2.5 text-left hover:bg-zinc-50"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className="size-2 shrink-0 rounded-full"
                          style={{ backgroundColor: t.category?.color ?? "#6b7280" }}
                        />
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-zinc-800">
                            {t.merchant ?? t.category?.name ?? "미분류"}
                          </p>
                          <p className="text-xs text-zinc-400">
                            {t.category?.name ?? "미분류"}
                            {t.payment_method ? ` · ${PAYMENT_LABEL[t.payment_method] ?? t.payment_method}` : ""}
                          </p>
                        </div>
                      </div>
                      <span
                        className={`text-sm font-semibold ${
                          t.type === "income" ? "text-emerald-600" : "text-rose-500"
                        }`}
                      >
                        {t.type === "income" ? "+" : "-"}{formatAmount(t.amount)}
                      </span>
                    </button>
                  ))}
                </div>
              ))
            )}
          </div>
        )}

        {tab === "통계" && (
          <div className="px-6 py-5">
            {catStats.length === 0 ? (
              <p className="py-12 text-center text-sm text-zinc-300">지출 내역이 없습니다</p>
            ) : (
              <div className="space-y-5">
                <p className="text-xs font-semibold text-zinc-400">카테고리별 지출</p>
                {catStats.map((c) => (
                  <div key={c.id}>
                    <div className="mb-1.5 flex items-center justify-between">
                      <span className="text-xs font-medium text-zinc-700">{c.name}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-zinc-400">
                          {expense > 0 ? Math.round((c.total / expense) * 100) : 0}%
                        </span>
                        <span className="text-xs font-semibold text-zinc-700">{formatAmount(c.total)}</span>
                      </div>
                    </div>
                    <div className="h-2 w-full rounded-full bg-zinc-100">
                      <div
                        className="h-2 rounded-full transition-all"
                        style={{
                          width: `${expense > 0 ? Math.min(100, (c.total / expense) * 100) : 0}%`,
                          backgroundColor: c.color,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {tab === "분석" && (
          <div className="px-6 py-8">
            {!analysis && !analyzing && (
              <div className="flex flex-col items-center gap-4">
                <div className="rounded-full bg-zinc-100 p-5">
                  <Sparkles size={22} className="text-zinc-400" />
                </div>
                <div className="text-center">
                  <p className="text-sm font-medium text-zinc-700">이번 달 소비 패턴 분석</p>
                  <p className="mt-1 text-xs text-zinc-400">AI가 맞춤형 인사이트를 제공합니다</p>
                </div>
                <button
                  onClick={() => { void handleAnalyze(); }}
                  className="rounded-lg bg-zinc-900 px-5 py-2 text-sm font-medium text-white hover:bg-zinc-700"
                >
                  분석 시작
                </button>
              </div>
            )}
            {analyzing && (
              <div className="flex flex-col items-center gap-3">
                <div className="size-6 animate-spin rounded-full border-2 border-zinc-200 border-t-zinc-600" />
                <p className="text-sm text-zinc-400">분석 중...</p>
              </div>
            )}
            {analysis && (
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Sparkles size={13} className="text-zinc-500" />
                  <p className="text-xs font-semibold text-zinc-500">AI 분석 결과</p>
                </div>
                <div className="rounded-xl bg-zinc-50 p-4">
                  <p className="whitespace-pre-wrap text-sm leading-relaxed text-zinc-700">{analysis}</p>
                </div>
                <button
                  onClick={() => setAnalysis(null)}
                  className="text-xs text-zinc-400 hover:text-zinc-600"
                >
                  다시 분석하기
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {selected && (
        <TransactionModal
          transaction={selected}
          categories={categories}
          onClose={() => setSelected(null)}
          onUpdated={handleUpdated}
          onDeleted={handleDeleted}
        />
      )}
    </div>
  );
}
