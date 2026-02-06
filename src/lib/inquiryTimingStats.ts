import { ClientInquiry } from "@/data/mockInquiries";

export interface TimingDistributionItem {
  label: string;
  count: number;
  percentage: number;
}

const DAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

const TIME_RANGES = [
  { label: "00:00–05:59", min: 0, max: 5 },
  { label: "06:00–08:59", min: 6, max: 8 },
  { label: "09:00–11:59", min: 9, max: 11 },
  { label: "12:00–14:59", min: 12, max: 14 },
  { label: "15:00–17:59", min: 15, max: 17 },
  { label: "18:00–20:59", min: 18, max: 20 },
  { label: "21:00–23:59", min: 21, max: 23 },
];

export function getInquiriesByDayOfWeek(inquiries: ClientInquiry[]): TimingDistributionItem[] {
  const total = inquiries.length;
  const counts = new Array(7).fill(0);

  for (const inquiry of inquiries) {
    counts[inquiry.createdAt.getDay()]++;
  }

  // Start from Monday (index 1) for a more natural display
  const mondayFirst = [1, 2, 3, 4, 5, 6, 0];

  return mondayFirst.map((dayIndex) => ({
    label: DAY_NAMES[dayIndex],
    count: counts[dayIndex],
    percentage: total > 0 ? Math.round((counts[dayIndex] / total) * 100) : 0,
  }));
}

export function getInquiriesByTimeOfDay(inquiries: ClientInquiry[]): TimingDistributionItem[] {
  const total = inquiries.length;

  return TIME_RANGES.map((range) => {
    const count = inquiries.filter((i) => {
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
