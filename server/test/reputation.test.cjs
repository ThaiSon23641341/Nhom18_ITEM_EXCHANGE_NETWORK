const assert = require('node:assert/strict');
const { test } = require('node:test');
const { calculateCancellationPenalty, computeUserStats } = require('../lib/reputation.cjs');

test('cancellation penalties increase by half an exchange reward each time', () => {
  assert.equal(calculateCancellationPenalty(0), 0);
  assert.equal(calculateCancellationPenalty(1), 5);
  assert.equal(calculateCancellationPenalty(2), 12.5);
  assert.equal(calculateCancellationPenalty(3), 22.5);
  assert.equal(calculateCancellationPenalty(4), 35);
});

test('cancellation penalty rejects invalid counts', () => {
  for (const count of [-1, 0.5, NaN, Infinity, '2', null, Number.MAX_SAFE_INTEGER + 1]) {
    assert.throws(() => calculateCancellationPenalty(count), RangeError);
  }
});

test('profile scores remain unchanged until cancellation penalties are integrated', () => {
  const data = {
    items: [{ id: 'item-1', ownerId: 'owner' }],
    appointments: [
      { itemId: 'item-1', requesterId: 'requester', status: 'completed' },
      { itemId: 'item-1', requesterId: 'requester', status: 'cancelled' },
    ],
    reports: [],
  };
  const db = { get: (name) => require('lodash').chain(data[name]) };
  assert.deepEqual(computeUserStats(db, 'owner'), { successfulExchanges: 1, reputation: 55 });
  assert.deepEqual(computeUserStats(db, 'requester'), { successfulExchanges: 1, reputation: 55 });
});
