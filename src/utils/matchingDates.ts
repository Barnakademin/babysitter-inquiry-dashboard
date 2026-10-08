export const isInvalidMatchingDate = (dateStr: unknown): boolean => {
  if (dateStr === null || dateStr === undefined || dateStr === false) {
    return true;
  }
  const s = String(dateStr).trim().replace(/^[(\[]|[)\]]$/g, '');
  if (s === '') return true;
  if (s === '0000-00-00' || s === '0000-00-00 00:00:00') return true;
  if (s.startsWith('0000-00-00')) return true;
  if (s === '1000-01-01' || s === '1000-01-01 00:00:00') return true;
  if (s.startsWith('1000-01-01')) return true;
  if (s.startsWith('1970-01-01')) return true;
  const iso = s.match(/^(\d{4})[-/.](\d{1,2})[-/.](\d{1,2})/);
  if (iso) {
    const y = parseInt(iso[1], 10);
    if (y <= 1000 || y < 1900) return true;
  }
  return false;
};

export const formatMatchingDateOnly = (dateStr: unknown): string => {
  if (isInvalidMatchingDate(dateStr)) return '';
  return String(dateStr).trim().replace(/^[(\[]|[)\]]$/g, '').split(' ')[0];
};

export const firstValidMatchingDate = (...candidates: unknown[]): string => {
  for (const c of candidates) {
    const d = formatMatchingDateOnly(c);
    if (d) return d;
  }
  return '';
};
