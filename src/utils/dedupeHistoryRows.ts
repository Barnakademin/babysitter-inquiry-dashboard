import type { HistoryItem } from "@/api/history";
import { isInvalidMatchingDate } from "@/utils/matchingDates";

/** Keep newest row per client+sitter+stage (+ meeting flag), same as Matching. */
export const dedupeHistoryRows = (history: HistoryItem[] = []): HistoryItem[] => {
  if (!Array.isArray(history) || history.length === 0) return [];

  const byKey = new Map<string, HistoryItem>();

  history.forEach((row) => {
    if (!row) return;
    const hasMeeting = !isInvalidMatchingDate(row.meeting);
    const key = [
      Number(row.client_id) || 0,
      Number(row.sitter_id) || 0,
      String(row.stage ?? ''),
      hasMeeting ? 'm' : '',
    ].join(':');

    const rank = Number(row.id ?? 0);
    const prev = byKey.get(key);
    if (!prev || rank >= Number(prev.id ?? 0)) {
      byKey.set(key, row);
    }
  });

  return Array.from(byKey.values());
};
