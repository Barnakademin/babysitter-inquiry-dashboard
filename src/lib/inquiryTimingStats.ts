import { ClientInquiry } from "../data/mockInquiries";

export interface TimingDistributionItem {
  label: string;
  count: number;
  percentage: number;
}

export interface HeatmapCell {
  day: string;
  dayIndex: number;
  timeRange: string;
  timeIndex: number;
  count: number;
  percentage: number;
}

export interface AvailableYear {
  year: string;
  months: { month: string; label: string }[];
}

const DAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const DAY_SHORT = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const TIME_RANGES = [
  { label: "00:00–05:59", short: "00–06", min: 0, max: 5 },
  { label: "06:00–08:59", short: "06–09", min: 6, max: 8 },
  { label: "09:00–11:59", short: "09–12", min: 9, max: 11 },
  { label: "12:00–14:59", short: "12–15", min: 12, max: 14 },
  { label: "15:00–17:59", short: "15–18", min: 15, max: 17 },
  { label: "18:00–20:59", short: "18–21", min: 18, max: 20 },
  { label: "21:00–23:59", short: "21–24", min: 21, max: 23 },
];

// Monday-first ordering
const MONDAY_FIRST = [1, 2, 3, 4, 5, 6, 0];

export function hasKnownTime(inquiry: ClientInquiry): boolean {
  const d = inquiry.createdAt;
  return d.getHours() !== 0 || d.getMinutes() !== 0;
}

export function filterInquiriesWithKnownTime(inquiries: ClientInquiry[]): ClientInquiry[] {
  return inquiries.filter(hasKnownTime);
}

export function getInquiriesByDayOfWeek(inquiries: ClientInquiry[]): TimingDistributionItem[] {
  const total = inquiries.length;
  const counts = new Array(7).fill(0);

  for (const inquiry of inquiries) {
    counts[inquiry.createdAt.getDay()]++;
  }

  return MONDAY_FIRST.map((dayIndex) => ({
    label: DAY_NAMES[dayIndex],
    count: counts[dayIndex],
    percentage: total > 0 ? Math.round((counts[dayIndex] / total) * 100) : 0,
  }));
}

export function getInquiriesByTimeOfDay(inquiries: ClientInquiry[]): TimingDistributionItem[] {
  const withTime = filterInquiriesWithKnownTime(inquiries);
  const total = withTime.length;

  return TIME_RANGES.map((range) => {
    const count = withTime.filter((i) => {
      const hour = i.createdAt.getHours();
      return hour >= range.min && hour <= range.max;
    }).length;

    return {
      label: range.label,
      count,
      percentage: total > 0 ? Math.round((count / total) * 100) : 0,
    };
  });
}

export function getHeatmapData(inquiries: ClientInquiry[]): {
  cells: HeatmapCell[];
  days: string[];
  timeRanges: string[];
  maxCount: number;
} {
  const withTime = filterInquiriesWithKnownTime(inquiries);
  const total = withTime.length;
  const grid: number[][] = MONDAY_FIRST.map(() => new Array(TIME_RANGES.length).fill(0));

  for (const inquiry of withTime) {
    const dayOfWeek = inquiry.createdAt.getDay();
    const hour = inquiry.createdAt.getHours();
    const dayIdx = MONDAY_FIRST.indexOf(dayOfWeek);
    const timeIdx = TIME_RANGES.findIndex((r) => hour >= r.min && hour <= r.max);
    if (dayIdx >= 0 && timeIdx >= 0) {
      grid[dayIdx][timeIdx]++;
    }
  }

  let maxCount = 0;
  const cells: HeatmapCell[] = [];

  for (let d = 0; d < MONDAY_FIRST.length; d++) {
    for (let t = 0; t < TIME_RANGES.length; t++) {
      const count = grid[d][t];
      if (count > maxCount) maxCount = count;
      cells.push({
        day: DAY_SHORT[MONDAY_FIRST[d]],
        dayIndex: d,
        timeRange: TIME_RANGES[t].short,
        timeIndex: t,
        count,
        percentage: total > 0 ? Math.round((count / total) * 100) : 0,
      });
    }
  }

  return {
    cells,
    days: MONDAY_FIRST.map((i) => DAY_SHORT[i]),
    timeRanges: TIME_RANGES.map((r) => r.short),
    maxCount,
  };
}

export function getAvailableYears(inquiries: ClientInquiry[]): AvailableYear[] {
  const yearMap = new Map<string, Map<string, string>>();

  for (const inquiry of inquiries) {
    const year = inquiry.createdAt.getFullYear().toString();
    const monthKey = `${year}-${String(inquiry.createdAt.getMonth() + 1).padStart(2, "0")}`;
    const monthLabel = inquiry.createdAt.toLocaleString("en-US", { month: "long", year: "numeric" });

    if (!yearMap.has(year)) yearMap.set(year, new Map());
    yearMap.get(year)!.set(monthKey, monthLabel);
  }

  return [...yearMap.keys()]
    .sort()
    .reverse()
    .map((year) => ({
      year,
      months: [...yearMap.get(year)!.entries()]
        .sort(([a], [b]) => b.localeCompare(a))
        .map(([month, label]) => ({ month, label })),
    }));
}
