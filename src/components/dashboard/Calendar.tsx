"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

const DAYS = ["일", "월", "화", "수", "목", "금", "토"];

export default function Calendar() {
  const today = new Date();
  const [current, setCurrent] = useState(new Date(today.getFullYear(), today.getMonth(), 1));

  const year = current.getFullYear();
  const month = current.getMonth();

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, month, 0).getDate();

  const cells: { day: number; type: "prev" | "current" | "next" }[] = [];

  for (let i = firstDay - 1; i >= 0; i--) {
    cells.push({ day: daysInPrevMonth - i, type: "prev" });
  }
  for (let i = 1; i <= daysInMonth; i++) {
    cells.push({ day: i, type: "current" });
  }
  const remaining = 42 - cells.length;
  for (let i = 1; i <= remaining; i++) {
    cells.push({ day: i, type: "next" });
  }

  const isToday = (day: number) =>
    day === today.getDate() &&
    month === today.getMonth() &&
    year === today.getFullYear();

  return (
    <div className="flex h-full flex-col p-6">
      {/* 헤더 */}
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-base font-semibold text-zinc-900">
          {year}년 {month + 1}월
        </h2>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setCurrent(new Date(year, month - 1, 1))}
            className="flex size-7 items-center justify-center rounded-lg text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700"
          >
            <ChevronLeft size={16} />
          </button>
          <button
            onClick={() => setCurrent(new Date(today.getFullYear(), today.getMonth(), 1))}
            className="rounded-lg px-2 py-1 text-xs text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700"
          >
            오늘
          </button>
          <button
            onClick={() => setCurrent(new Date(year, month + 1, 1))}
            className="flex size-7 items-center justify-center rounded-lg text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      {/* 요일 헤더 */}
      <div className="mb-2 grid grid-cols-7 text-center">
        {DAYS.map((d, i) => (
          <span
            key={d}
            className={`text-xs font-medium ${
              i === 0 ? "text-red-400" : i === 6 ? "text-blue-400" : "text-zinc-400"
            }`}
          >
            {d}
          </span>
        ))}
      </div>

      {/* 날짜 그리드 */}
      <div className="grid flex-1 grid-cols-7 grid-rows-6 gap-y-1">
        {cells.map((cell, idx) => {
          const colIdx = idx % 7;
          const isSun = colIdx === 0;
          const isSat = colIdx === 6;
          const isCurrent = cell.type === "current";
          const todayMark = isCurrent && isToday(cell.day);

          return (
            <div key={idx} className="flex items-start justify-center pt-1">
              <span
                className={`flex size-7 items-center justify-center rounded-full text-sm transition-colors ${
                  todayMark
                    ? "bg-zinc-900 font-semibold text-white"
                    : !isCurrent
                      ? "text-zinc-200"
                      : isSun
                        ? "text-red-400 hover:bg-zinc-50"
                        : isSat
                          ? "text-blue-400 hover:bg-zinc-50"
                          : "text-zinc-700 hover:bg-zinc-50"
                }`}
              >
                {cell.day}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
