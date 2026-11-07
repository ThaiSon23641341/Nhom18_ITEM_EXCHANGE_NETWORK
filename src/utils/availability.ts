export const DEFAULT_AVAILABLE_DAYS = 30;
export const MAX_AVAILABLE_DAYS = 90;

export function defaultAvailableUntil(now = new Date(), days = DEFAULT_AVAILABLE_DAYS): string {
  const result = new Date(now);
  result.setUTCDate(result.getUTCDate() + days);
  return result.toISOString();
}

export function isAvailableUntilValid(value: string, now = new Date(), maxDays = MAX_AVAILABLE_DAYS): boolean {
  const deadline = new Date(value);
  if (!value || Number.isNaN(deadline.getTime())) return false;
  const latest = new Date(now);
  latest.setUTCDate(latest.getUTCDate() + maxDays);
  return deadline.getTime() > now.getTime() && deadline.getTime() <= latest.getTime();
}
