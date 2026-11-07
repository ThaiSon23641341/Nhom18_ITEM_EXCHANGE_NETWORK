import { defaultAvailableUntil, isAvailableUntilValid } from './availability';

describe('item availability', () => {
  test('defaults to one month and caps deadline at 90 days', () => {
    const now = new Date('2026-11-07T00:00:00.000Z');
    const deadline = new Date(defaultAvailableUntil(now));
    expect(deadline.toISOString()).toBe('2026-12-07T00:00:00.000Z');
    expect(isAvailableUntilValid('2027-02-07T00:00:00.000Z', now)).toBe(false);
    expect(isAvailableUntilValid('2026-12-07T00:00:00.000Z', now)).toBe(true);
  });
});
