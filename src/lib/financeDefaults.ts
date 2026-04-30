export const EXPENSE_DEFAULTS = [
  { name: "식비", color: "#f97316" },
  { name: "교통", color: "#3b82f6" },
  { name: "여가", color: "#8b5cf6" },
  { name: "쇼핑", color: "#ec4899" },
  { name: "구독", color: "#6366f1" },
  { name: "의료", color: "#ef4444" },
  { name: "교육", color: "#10b981" },
  { name: "기타", color: "#6b7280" },
];

export const INCOME_DEFAULTS = [
  { name: "급여", color: "#22c55e" },
  { name: "부수입", color: "#84cc16" },
  { name: "기타", color: "#6b7280" },
];

export function formatAmount(amount: number): string {
  return amount.toLocaleString("ko-KR") + "원";
}

export function formatDate(dateStr: string): string {
  const parts = dateStr.split("-").map(Number) as [number, number, number];
  return new Date(parts[0], parts[1] - 1, parts[2]).toLocaleDateString("ko-KR", {
    month: "long",
    day: "numeric",
    weekday: "short",
  });
}

export function currentMonthRange(): { start: string; end: string } {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const last = new Date(y, now.getMonth() + 1, 0).getDate();
  return { start: `${y}-${m}-01`, end: `${y}-${m}-${last}` };
}
