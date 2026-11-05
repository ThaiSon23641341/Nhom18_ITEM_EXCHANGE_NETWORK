const crypto = require('node:crypto');

// Keep these patterns in sync with src/services/authService.ts.
const STUDENT_EMAIL_PATTERN =
  /^(?:([0-9]{8})\.([a-zA-Z]+(?:[.-][a-zA-Z]+)*)|sinhvien001|sinhvien002|moderator)@student\.iuh\.edu\.vn$/i;
const PASSWORD_PATTERN = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9])\S{8,64}$/;

// Seeded accounts have no stored credential yet; they accept this demo password.
const DEMO_PASSWORD = 'Demo@1234';

function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.scryptSync(password, salt, 32).toString('hex');
  return `${salt}:${hash}`;
}

function verifyPassword(password, stored) {
  if (typeof stored !== 'string') return false;
  const [salt, hash] = stored.split(':');
  if (!salt || !hash) return false;
  const expected = Buffer.from(hash, 'hex');
  const actual = crypto.scryptSync(password, salt, expected.length);
  return crypto.timingSafeEqual(actual, expected);
}

module.exports = {
  DEMO_PASSWORD,
  PASSWORD_PATTERN,
  STUDENT_EMAIL_PATTERN,
  hashPassword,
  verifyPassword,
};
