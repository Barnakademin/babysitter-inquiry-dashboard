import { ClientInquiry } from "@/data/mockInquiries";
import { differenceInDays, format, startOfMonth } from "date-fns";

// Stage meanings:
// Stage 1-6: Inquiry in matching process
// Stage 7: Inquiry became a client
// Stage 8-9: Inquiry did not become / is no longer a client

export type ConversionStatus = "converted" | "not_converted" | "in_progress";

export interface ConversionStats {
  total: number;
  converted: number;
  notConverted: number;
  inProgress: number;
  conversionRate: number;
  avgDaysToConvert: number | null;
  medianDaysToConvert: number | null;
}

export interface BreakdownItem {
  label: string;
  total: number;
  converted: number;
  notConverted: number;
  inProgress: number;
  conversionRate: number;
  avgDaysToConvert: number | null;
}

export interface MonthlyStats {
  month: string;
  monthLabel: string;
  year: string;
  stats: ConversionStats;
}

export interface YearlyStats {
  year: string;
  stats: ConversionStats;
  months: MonthlyStats[];
}

export function getConversionStatus(inquiry: ClientInquiry): ConversionStatus {
  if (inquiry.stage === 7) return "converted";
  if (inquiry.stage >= 8) return "not_converted";
  return "in_progress";
}

export function getDaysToConvert(inquiry: ClientInquiry): number | null {
  if (inquiry.stage !== 7) return null;
  return differenceInDays(inquiry.stageDate, inquiry.createdAt);
}

export function calculateAverage(numbers: number[]): number | null {
  if (numbers.length === 0) return null;
  return Math.round(numbers.reduce((a, b) => a + b, 0) / numbers.length);
}

export function calculateMedian(numbers: number[]): number | null {
  if (numbers.length === 0) return null;
  const sorted = [...numbers].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 !== 0 ? sorted[mid] : Math.round((sorted[mid - 1] + sorted[mid]) / 2);
}

export function calculateConversionStats(inquiries: ClientInquiry[]): ConversionStats {
  const total = inquiries.length;
  const converted = inquiries.filter((i) => getConversionStatus(i) === "converted").length;
  const notConverted = inquiries.filter((i) => getConversionStatus(i) === "not_converted").length;
  const inProgress = inquiries.filter((i) => getConversionStatus(i) === "in_progress").length;

  const daysToConvert = inquiries
    .filter((i) => i.stage === 7)
    .map((i) => getDaysToConvert(i)!)
    .filter((d) => d !== null);

  const conversionRate = total > 0 ? Math.round((converted / total) * 100) : 0;

  return {
    total,
    converted,
    notConverted,
    inProgress,
    conversionRate,
    avgDaysToConvert: calculateAverage(daysToConvert),
    medianDaysToConvert: calculateMedian(daysToConvert),
  };
}

export function getBreakdownByCity(inquiries: ClientInquiry[]): BreakdownItem[] {
  const cities = [...new Set(inquiries.map((i) => i.city))];
  
  return cities.map((city) => {
    const cityInquiries = inquiries.filter((i) => i.city === city);
    const stats = calculateConversionStats(cityInquiries);
    
    return {
      label: city,
      total: stats.total,
      converted: stats.converted,
      notConverted: stats.notConverted,
      inProgress: stats.inProgress,
      conversionRate: stats.conversionRate,
      avgDaysToConvert: stats.avgDaysToConvert,
    };
  }).sort((a, b) => b.total - a.total);
}

export function getBreakdownByLanguage(inquiries: ClientInquiry[]): BreakdownItem[] {
  // Get all unique languages from the languages array
  const allLanguages = [...new Set(inquiries.flatMap((i) => i.languages))];
  
  return allLanguages.map((language) => {
    const langInquiries = inquiries.filter((i) => i.languages.includes(language));
    const stats = calculateConversionStats(langInquiries);
    
    return {
      label: language,
      total: stats.total,
      converted: stats.converted,
      notConverted: stats.notConverted,
      inProgress: stats.inProgress,
      conversionRate: stats.conversionRate,
      avgDaysToConvert: stats.avgDaysToConvert,
    };
  }).sort((a, b) => b.total - a.total);
}

export function getBreakdownByNumberOfKids(inquiries: ClientInquiry[]): BreakdownItem[] {
  const kidCounts = [...new Set(inquiries.map((i) => i.numberOfKids))].sort((a, b) => a - b);
  
  return kidCounts.map((count) => {
    const countInquiries = inquiries.filter((i) => i.numberOfKids === count);
    const stats = calculateConversionStats(countInquiries);
    
    return {
      label: count === 1 ? "1 child" : `${count} children`,
      total: stats.total,
      converted: stats.converted,
      notConverted: stats.notConverted,
      inProgress: stats.inProgress,
      conversionRate: stats.conversionRate,
      avgDaysToConvert: stats.avgDaysToConvert,
    };
  });
}

export function getBreakdownByHelpType(inquiries: ClientInquiry[]): BreakdownItem[] {
  const helpTypes = [...new Set(inquiries.map((i) => i.needHelpWith))];
  
  return helpTypes.map((helpType) => {
    const typeInquiries = inquiries.filter((i) => i.needHelpWith === helpType);
    const stats = calculateConversionStats(typeInquiries);
    
    return {
      label: helpType,
      total: stats.total,
      converted: stats.converted,
      notConverted: stats.notConverted,
      inProgress: stats.inProgress,
      conversionRate: stats.conversionRate,
      avgDaysToConvert: stats.avgDaysToConvert,
    };
  }).sort((a, b) => b.total - a.total);
}

export function getBreakdownByFrequency(inquiries: ClientInquiry[]): BreakdownItem[] {
  const frequencies = [...new Set(inquiries.map((i) => i.howOften))];
  
  return frequencies.map((frequency) => {
    const freqInquiries = inquiries.filter((i) => i.howOften === frequency);
    const stats = calculateConversionStats(freqInquiries);
    
    return {
      label: frequency,
      total: stats.total,
      converted: stats.converted,
      notConverted: stats.notConverted,
      inProgress: stats.inProgress,
      conversionRate: stats.conversionRate,
      avgDaysToConvert: stats.avgDaysToConvert,
    };
  }).sort((a, b) => b.total - a.total);
}

export function getBreakdownByNannyLanguagePreference(inquiries: ClientInquiry[]): BreakdownItem[] {
  const preferences = [...new Set(inquiries.map((i) => i.nannyLanguagePreference))];
  
  const labelMap: Record<string, string> = {
    'swedish-speaking': 'Swedish-speaking nanny',
    'bilingual': 'Bilingual nanny',
  };
  
  return preferences.map((pref) => {
    const prefInquiries = inquiries.filter((i) => i.nannyLanguagePreference === pref);
    const stats = calculateConversionStats(prefInquiries);
    
    return {
      label: labelMap[pref] || pref,
      total: stats.total,
      converted: stats.converted,
      notConverted: stats.notConverted,
      inProgress: stats.inProgress,
      conversionRate: stats.conversionRate,
      avgDaysToConvert: stats.avgDaysToConvert,
    };
  }).sort((a, b) => b.total - a.total);
}

export function getBreakdownByFormLanguage(inquiries: ClientInquiry[]): BreakdownItem[] {
  const formLanguages = [...new Set(inquiries.map((i) => i.formLanguage))];
  
  const labelMap: Record<string, string> = {
    'sv': 'Swedish',
    'en': 'English',
    'de': 'German',
    'fr': 'French',
    'es': 'Spanish',
  };
  
  return formLanguages.map((lang) => {
    const langInquiries = inquiries.filter((i) => i.formLanguage === lang);
    const stats = calculateConversionStats(langInquiries);
    
    return {
      label: labelMap[lang] || lang,
      total: stats.total,
      converted: stats.converted,
      notConverted: stats.notConverted,
      inProgress: stats.inProgress,
      conversionRate: stats.conversionRate,
      avgDaysToConvert: stats.avgDaysToConvert,
    };
  }).sort((a, b) => b.total - a.total);
}

export function getMonthlyStats(inquiries: ClientInquiry[]): MonthlyStats[] {
  // Group inquiries by month of creation
  const monthMap = new Map<string, ClientInquiry[]>();
  
  inquiries.forEach((inquiry) => {
    const monthKey = format(startOfMonth(inquiry.createdAt), "yyyy-MM");
    const existing = monthMap.get(monthKey) || [];
    monthMap.set(monthKey, [...existing, inquiry]);
  });
  
  // Sort by month (most recent first)
  const sortedMonths = [...monthMap.keys()].sort().reverse();
  
  return sortedMonths.map((month) => {
    const monthInquiries = monthMap.get(month) || [];
    const firstInquiry = monthInquiries[0];
    const year = format(firstInquiry.createdAt, "yyyy");
    
    return {
      month,
      monthLabel: format(firstInquiry.createdAt, "MMMM yyyy"),
      year,
      stats: calculateConversionStats(monthInquiries),
    };
  });
}

export function getYearlyStats(inquiries: ClientInquiry[]): YearlyStats[] {
  const monthlyStats = getMonthlyStats(inquiries);
  
  // Group months by year
  const yearMap = new Map<string, MonthlyStats[]>();
  
  monthlyStats.forEach((m) => {
    const existing = yearMap.get(m.year) || [];
    yearMap.set(m.year, [...existing, m]);
  });
  
  // Sort years (most recent first)
  const sortedYears = [...yearMap.keys()].sort().reverse();
  
  return sortedYears.map((year) => {
    const months = yearMap.get(year) || [];
    const yearInquiries = inquiries.filter(
      (i) => format(i.createdAt, "yyyy") === year
    );
    
    return {
      year,
      stats: calculateConversionStats(yearInquiries),
      months,
    };
  });
}
