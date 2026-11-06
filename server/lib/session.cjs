const crypto = require('node:crypto');

const SESSION_TTL_MS = 30 * 24 * 60 * 60 * 1000;

const hashToken = (token) => crypto.createHash('sha256').update(token).digest('hex');

function sessions(db) {
  if (!db.has('sessions').value()) db.set('sessions', []).write();
  return db.get('sessions');
}

// Only a hash of the token is stored, so a leaked db.json cannot be replayed.
function createSession(db, userId) {
  const token = crypto.randomBytes(32).toString('hex');
  const now = Date.now();
  const expiresAt = new Date(now + SESSION_TTL_MS).toISOString();
  sessions(db)
    .remove((session) => Date.parse(session.expiresAt) <= now)
    .write();
  sessions(db)
    .push({ tokenHash: hashToken(token), userId, createdAt: new Date(now).toISOString(), expiresAt })
    .write();
  return { token, expiresAt };
}

function readToken(request) {
  const header = request.get('authorization') ?? '';
  const match = /^Bearer ([0-9a-f]{64})$/i.exec(header.trim());
  return match ? match[1] : null;
}

// Returns the signed-in user id, or null when the token is missing, unknown or expired.
function authenticate(db, request) {
  const token = readToken(request);
  if (!token) return null;
  const session = sessions(db).find({ tokenHash: hashToken(token) }).value();
  if (!session || Date.parse(session.expiresAt) <= Date.now()) return null;
  return session.userId;
}

function revokeToken(db, request) {
  const token = readToken(request);
  if (token) sessions(db).remove({ tokenHash: hashToken(token) }).write();
}

function revokeUserSessions(db, userId) {
  sessions(db).remove({ userId }).write();
}

module.exports = {
  SESSION_TTL_MS,
  authenticate,
  createSession,
  revokeToken,
  revokeUserSessions,
};
