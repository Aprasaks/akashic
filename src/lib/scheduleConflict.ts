export interface TimeRange {
  id: string;
  title: string;
  startMin: number;
  endMin: number;
}

function toMinutes(isoStr: string): number {
  const h = parseInt(isoStr.slice(11, 13), 10);
  const m = parseInt(isoStr.slice(14, 16), 10);
  return h * 60 + m;
}

export function toTimeRange(schedule: {
  id: string;
  title: string;
  start_at: string;
  end_at: string | null;
}): TimeRange {
  const startMin = toMinutes(schedule.start_at);
  let endMin = schedule.end_at ? toMinutes(schedule.end_at) : startMin + 30;
  if (endMin <= startMin) endMin += 24 * 60;
  return { id: schedule.id, title: schedule.title, startMin, endMin };
}

export function overlaps(a: TimeRange, b: TimeRange): boolean {
  return a.startMin < b.endMin && a.endMin > b.startMin;
}

export function findConflicts(
  target: TimeRange,
  others: TimeRange[],
): TimeRange[] {
  return others.filter((o) => o.id !== target.id && overlaps(target, o));
}

export function hasAnyConflict(ranges: TimeRange[]): boolean {
  for (let i = 0; i < ranges.length; i++) {
    for (let j = i + 1; j < ranges.length; j++) {
      if (overlaps(ranges[i]!, ranges[j]!)) return true;
    }
  }
  return false;
}

export function getConflictingIds(ranges: TimeRange[]): Set<string> {
  const ids = new Set<string>();
  for (let i = 0; i < ranges.length; i++) {
    for (let j = i + 1; j < ranges.length; j++) {
      if (overlaps(ranges[i]!, ranges[j]!)) {
        ids.add(ranges[i]!.id);
        ids.add(ranges[j]!.id);
      }
    }
  }
  return ids;
}
