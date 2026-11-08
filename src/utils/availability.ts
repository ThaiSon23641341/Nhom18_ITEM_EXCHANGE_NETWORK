export const DEFAULT_AVAILABLE_DAYS = 30;
export const MAX_AVAILABLE_DAYS = 90;

export function defaultAvailableUntil(now = new Date(), days = DEFAULT_AVAILABLE_DAYS): string {
  const result = new Date(now);
  result.setUTCDate(result.getUTCDate() + days);
  return result.toISOString();
}

export function availableUntilToDateInput(value: string): string {
  return /^\d{4}-\d{2}-\d{2}/.test(value) ? value.slice(0, 10) : '';
}

export function availableUntilToDate(value: string): Date | null {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

export function formatAvailableUntilDate(value: string): string {
  const date = availableUntilToDate(value);
  if (!date) return '';
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function formatAvailableUntilTime(value: string): string {
  const date = availableUntilToDate(value);
  if (!date) return '';
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${hours}:${minutes}`;
}

export function combineAvailableUntil(dateValue: string, timeValue: string): string {
  const dateMatch = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateValue);
  const timeMatch = /^(\d{2}):(\d{2})$/.exec(timeValue);
  if (!dateMatch || !timeMatch) return '';
  const [, year, month, day] = dateMatch;
  const [, hours, minutes] = timeMatch;
  const combined = new Date(
    Number(year),
    Number(month) - 1,
    Number(day),
    Number(hours),
    Number(minutes),
    0,
    0,
  );
  return Number.isNaN(combined.getTime()) ? '' : combined.toISOString();
}

export function isAvailableUntilValid(value: string, now = new Date(), maxDays = MAX_AVAILABLE_DAYS): boolean {
  if (!value) return false;
  const datePrefixMatch = /^(\d{4})-(\d{2})-(\d{2})/.exec(value);
  if (datePrefixMatch) {
    const year = Number(datePrefixMatch[1]);
    const month = Number(datePrefixMatch[2]);
    const day = Number(datePrefixMatch[3]);
    const parsed = new Date(Date.UTC(year, month - 1, day));
    if (
      parsed.getUTCFullYear() !== year
      || parsed.getUTCMonth() !== month - 1
      || parsed.getUTCDate() !== day
    ) return false;
  }
  const deadline = new Date(value);
  if (!value || Number.isNaN(deadline.getTime())) return false;
  const latest = new Date(now);
  latest.setUTCDate(latest.getUTCDate() + maxDays);
  return deadline.getTime() > now.getTime() && deadline.getTime() <= latest.getTime();
}
