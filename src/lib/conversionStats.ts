import { ClientInquiry } from "../data/mockInquiries";
import { differenceInDays, format, startOfMonth } from "date-fns";

// Stage meanings (логика как в barnakademin-insight):
// Stage 7: клиент стал клиентом; если он когда-либо был в стадии 7 — в статистике всегда считается конвертированным, даже после перехода в 8/9.
// Stage 1-6: в процессе.
// Stage 8-9: не конвертирован (если никогда не был в 7).

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
  if (inquiry.stage === 7 || inquiry.everReachedStage7) return "converted";
  if (inquiry.stage >= 8) return "not_converted";
  return "in_progress";
}

export function getDaysToConvert(inquiry: ClientInquiry): number | null {
  const dateStage7 = inquiry.stage === 7
    ? inquiry.stageDate
    : (inquiry.everReachedStage7 && inquiry.firstStage7Date ? inquiry.firstStage7Date : null);
  if (!dateStage7) return null;
  return differenceInDays(dateStage7, inquiry.createdAt);
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
    .filter((i) => getConversionStatus(i) === "converted")
    .map((i) => getDaysToConvert(i))
    .filter((d): d is number => d !== null);

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

// Group by combination: same set of values = one bucket (e.g. "Swedish + English")
function getBreakdownByCombination(
  inquiries: ClientInquiry[],
  getItems: (i: ClientInquiry) => string[],
  joinLabel: string = " + "
): BreakdownItem[] {
  const combinationMap = new Map<string, ClientInquiry[]>();
  for (const inquiry of inquiries) {
    const items = getItems(inquiry).filter(Boolean);
    if (items.length === 0) continue;
    const key = [...items].sort((a, b) => a.localeCompare(b)).join(", ");
    const existing = combinationMap.get(key) || [];
    combinationMap.set(key, [...existing, inquiry]);
  }
  return Array.from(combinationMap.entries())
    .map(([key, group]) => {
      const label = key.split(", ").join(joinLabel);
      const stats = calculateConversionStats(group);
      return {
        label,
        total: stats.total,
        converted: stats.converted,
        notConverted: stats.notConverted,
        inProgress: stats.inProgress,
        conversionRate: stats.conversionRate,
        avgDaysToConvert: stats.avgDaysToConvert,
      };
    })
    .sort((a, b) => b.total - a.total);
}

export function getBreakdownByLanguage(inquiries: ClientInquiry[]): BreakdownItem[] {
  return getBreakdownByCombination(inquiries, (i) => i.languages || []);
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
  return getBreakdownByCombination(inquiries, (i) => {
    const raw = (i.needHelpWith || "").trim();
    if (!raw) return [];
    return raw.split(",").map((s) => s.trim()).filter(Boolean);
  });
}

function getFrequencyOrder(label: string): number {
  const match = label.match(/^(\d+)/);
  return match ? parseInt(match[1], 10) : 999;
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
  }).sort((a, b) => getFrequencyOrder(a.label) - getFrequencyOrder(b.label));
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

export function getBreakdownByService(inquiries: ClientInquiry[]): BreakdownItem[] {
  const services = [...new Set(inquiries.map((i) => i.service))];
  
  const labelMap: Record<string, string> = {
    'babysitting': 'BB (Babysitting)',
    'nanny': 'KB (Nanny)',
  };
  
  return services.map((service) => {
    const serviceInquiries = inquiries.filter((i) => i.service === service);
    const stats = calculateConversionStats(serviceInquiries);
    
    return {
      label: labelMap[service] || service,
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
