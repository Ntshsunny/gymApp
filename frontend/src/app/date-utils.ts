// Dates are handled as local "yyyy-MM-dd" strings (never via toISOString, which shifts to UTC).
const pad = (n: number): string => String(n).padStart(2, '0');

export const fmt = (d: Date): string => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

export const todayStr = (): string => fmt(new Date());

export const parse = (s: string): Date => {
  const [y, m, d] = s.split('-').map(Number);
  return new Date(y, m - 1, d);
};

export const addDays = (s: string, n: number): string => {
  const d = parse(s);
  d.setDate(d.getDate() + n);
  return fmt(d);
};

export const isValidDate = (s: string | null): s is string =>
  !!s && /^\d{4}-\d{2}-\d{2}$/.test(s) && !isNaN(parse(s).getTime());
