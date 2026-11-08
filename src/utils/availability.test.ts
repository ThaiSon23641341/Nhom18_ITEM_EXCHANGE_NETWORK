import {
  combineAvailableUntil,
  defaultAvailableUntil,
  formatAvailableUntilDate,
  formatAvailableUntilTime,
  isAvailableUntilValid,
} from './availability';

describe('item availability', () => {
  test('defaults to one month and caps deadline at 90 days', () => {
    const now = new Date('2026-11-07T00:00:00.000Z');
    const deadline = new Date(defaultAvailableUntil(now));
    expect(deadline.toISOString()).toBe('2026-12-07T00:00:00.000Z');
    expect(isAvailableUntilValid('2027-02-07T00:00:00.000Z', now)).toBe(false);
    expect(isAvailableUntilValid('2026-12-07T00:00:00.000Z', now)).toBe(true);
  });

  test('rejects impossible calendar dates', () => {
    const now = new Date('2026-11-07T00:00:00.000Z');
    expect(isAvailableUntilValid('2026-11-31', now)).toBe(false);
    expect(isAvailableUntilValid('2026-02-29', now)).toBe(false);
    expect(isAvailableUntilValid('2028-02-29', new Date('2027-01-01T00:00:00.000Z'))).toBe(false);
  });

  test('formats and combines a selected date and time', () => {
    const deadline = '2026-12-08T23:30:00.000Z';
    expect(formatAvailableUntilDate(deadline)).toBeTruthy();
    expect(formatAvailableUntilTime(deadline)).toBeTruthy();

    const combined = combineAvailableUntil('2026-12-08', '23:30');
    expect(new Date(combined).getFullYear()).toBe(2026);
  });
});
