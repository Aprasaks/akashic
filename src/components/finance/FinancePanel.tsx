"use client";

import Link from "next/link";
import { Plus, TrendingUp, TrendingDown } from "lucide-react";
import ContextPanel from "@/components/layout/ContextPanel";
import { formatAmount, formatDate } from "@/lib/financeDefaults";
import type { Transaction } from "@/types/finance";

interface FinancePanelProps {
  income: number;
  expense: number;
  recent: Transaction[];
}

export default function FinancePanel({ income, expense, recent }: FinancePanelProps) {
  const balance = income - expense;

  return (
    <ContextPanel
      title="가계부"
      action={
        <Link
          href="/dashboard/finance"
          className="flex size-6 items-center justify-center rounded-md text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700"
        >
          <Plus size={14} strokeWidth={2} />
        </Link>
      }
    >
      <div className="border-b border-zinc-100 px-4 py-4">
        <p className="mb-3 text-xs font-semibold text-zinc-400">이번 달</p>
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <TrendingUp size={12} className="text-emerald-500" />
              <span className="text-xs text-zinc-500">수입</span>
            </div>
            <span className="text-xs font-medium text-emerald-600">{formatAmount(income)}</span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <TrendingDown size={12} className="text-rose-500" />
              <span className="text-xs text-zinc-500">지출</span>
            </div>
            <span className="text-xs font-medium text-rose-500">{formatAmount(expense)}</span>
          </div>
          <div className="mt-1 flex items-center justify-between border-t border-zinc-100 pt-2">
            <span className="text-xs font-semibold text-zinc-700">잔액</span>
            <span className={`text-xs font-bold ${balance >= 0 ? "text-zinc-900" : "text-rose-500"}`}>
              {balance < 0 ? "-" : ""}{formatAmount(Math.abs(balance))}
            </span>
          </div>
        </div>
      </div>

      <div className="flex flex-col py-2">
        <p className="px-4 pb-1 pt-2 text-xs font-semibold text-zinc-400">최근 내역</p>
        {recent.length === 0 ? (
          <p className="px-4 py-4 text-center text-xs text-zinc-300">내역이 없습니다</p>
        ) : (
          recent.map((t) => (
            <div key={t.id} className="flex items-center justify-between px-4 py-2">
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-medium text-zinc-800">
                  {t.merchant ?? t.category?.name ?? "미분류"}
                </p>
                <p className="text-xs text-zinc-400">{formatDate(t.date)}</p>
              </div>
              <span className={`ml-2 shrink-0 text-xs font-semibold ${t.type === "income" ? "text-emerald-600" : "text-rose-500"}`}>
                {t.type === "income" ? "+" : "-"}{formatAmount(t.amount)}
              </span>
            </div>
          ))
        )}
      </div>
    </ContextPanel>
  );
}
