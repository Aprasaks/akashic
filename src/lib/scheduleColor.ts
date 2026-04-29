const COLORS = [
  { border: "border-sky-400",     bg: "bg-sky-50",     hover: "hover:bg-sky-100",     dot: "bg-sky-400",     text: "text-sky-700" },
  { border: "border-pink-400",    bg: "bg-pink-50",    hover: "hover:bg-pink-100",    dot: "bg-pink-400",    text: "text-pink-700" },
  { border: "border-violet-400",  bg: "bg-violet-50",  hover: "hover:bg-violet-100",  dot: "bg-violet-400",  text: "text-violet-700" },
  { border: "border-emerald-400", bg: "bg-emerald-50", hover: "hover:bg-emerald-100", dot: "bg-emerald-400", text: "text-emerald-700" },
  { border: "border-amber-400",   bg: "bg-amber-50",   hover: "hover:bg-amber-100",   dot: "bg-amber-400",   text: "text-amber-700" },
  { border: "border-rose-400",    bg: "bg-rose-50",    hover: "hover:bg-rose-100",    dot: "bg-rose-400",    text: "text-rose-700" },
  { border: "border-indigo-400",  bg: "bg-indigo-50",  hover: "hover:bg-indigo-100",  dot: "bg-indigo-400",  text: "text-indigo-700" },
] as const;

export type ScheduleColor = (typeof COLORS)[number];

export function getScheduleColor(id: string): ScheduleColor {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = (hash * 31 + id.charCodeAt(i)) >>> 0;
  }
  return COLORS[hash % COLORS.length]!;
}
