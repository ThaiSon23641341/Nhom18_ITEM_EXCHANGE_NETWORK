const BASE_REPUTATION = 50;
const POINTS_PER_EXCHANGE = 5;
const POINTS_PER_ACTIONED_REPORT = 10;

function calculateCancellationPenalty(count) {
  if (!Number.isSafeInteger(count) || count < 0) {
    throw new RangeError('Cancellation count must be a non-negative safe integer.');
  }
  return POINTS_PER_EXCHANGE * count * (count + 3) / 4;
}

// Exchange/report stats are derived; moderators may persist a manual adjustment.
function computeUserStats(db, userId) {
  const ownedItemIds = new Set(
    db.get('items').filter({ ownerId: userId }).map('id').value(),
  );
  const successfulExchanges = db
    .get('appointments')
    .filter((appointment) => appointment.status === 'completed'
      && (appointment.requesterId === userId || ownedItemIds.has(appointment.itemId)))
    .size()
    .value();
  const actionedReports = db
    .get('reports')
    .filter((report) => report.status === 'actioned' && ownedItemIds.has(report.itemId))
    .size()
    .value();
  const score = BASE_REPUTATION
    + POINTS_PER_EXCHANGE * successfulExchanges
    - POINTS_PER_ACTIONED_REPORT * actionedReports
    + (db.get('users').find({ id: userId }).value()?.reputationAdjustment ?? 0);
  return {
    successfulExchanges,
    reputation: Math.min(100, Math.max(0, score)),
  };
}

module.exports = { calculateCancellationPenalty, computeUserStats };
