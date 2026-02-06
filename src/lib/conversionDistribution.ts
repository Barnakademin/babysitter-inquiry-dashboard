import { ClientInquiry } from "@/data/mockInquiries";
import { getDaysToConvert } from "./conversionStats";

export interface DistributionRange {
  label: string;
  min: number;
  max: number;
  count: number;
  percentage: number;
}

const RANGES = [
  { label: "0–7 days", min: 0, max: 7 },
  { label: "8–14 days", min: 8, max: 14 },
  { label: "15–30 days", min: 15, max: 30 },
  { label: "31–60 days", min: 31, max: 60 },
  { label: "60+ days", min: 61, max: Infinity },
];

export function getTimeToConvertDistribution(inquiries: ClientInquiry[]): DistributionRange[] {
  const convertedWithDays = inquiries
    .filter((i) => i.stage === 7)
    .map((i) => getDaysToConvert(i)!)
    .filter((d) => d !== null);

  const totalConverted = convertedWithDays.length;

  return RANGES.map((range) => {
    const count = convertedWithDays.filter(
      (d) => d >= range.min && d <= range.max
    ).length;

    return {
      label: range.label,
      min: range.min,
      max: range.max,
      count,
      percentage: totalConverted > 0 ? Math.round((count / totalConverted) * 100) : 0,
    };
  });
}
