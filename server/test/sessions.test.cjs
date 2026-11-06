const assert = require('node:assert/strict');
const { after, before, test } = require('node:test');
const { loginAs, postJson, startTestServer } = require('./helpers.cjs');

let context;

before(async () => {
  context = await startTestServer();
});

after(async () => {
  await context?.close();
});

const get = (route, headers) => fetch(`${context.baseUrl}${route}`, { headers });
const patch = (route, body, headers = {}) => fetch(`${context.baseUrl}${route}`, {
  method: 'PATCH',
  headers: { 'Content-Type': 'application/json', ...headers },
  body: JSON.stringify(body),
});

test('session endpoint restores the user and rejects bad tokens', async () => {
  const { headers, user } = await loginAs(context.baseUrl);
  const restored = await get('/auth/session', headers);
  assert.equal(restored.status, 200);
  assert.equal((await restored.json()).user.id, user.id);

  assert.equal((await get('/auth/session')).status, 401);
  assert.equal((await get('/auth/session', { Authorization: `Bearer ${'0'.repeat(64)}` })).status, 401);
});

test('logout revokes only the token that was used', async () => {
  const first = await loginAs(context.baseUrl);
  const second = await loginAs(context.baseUrl);
  const out = await fetch(`${context.baseUrl}/auth/session`, { method: 'DELETE', headers: first.headers });
  assert.equal(out.status, 200);
  assert.equal((await get('/auth/session', first.headers)).status, 401);
  assert.equal((await get('/auth/session', second.headers)).status, 200);
});

test('session hashes are stored, never the token, and /sessions is not served', async () => {
  const { token } = await loginAs(context.baseUrl);
  assert.equal((await get('/sessions')).status, 404);
  const fs = require('node:fs');
  const stored = fs.readFileSync(context.database, 'utf8');
  assert.equal(stored.includes('tokenHash'), true);
  assert.equal(stored.includes(token), false);
});
test('expired sessions are rejected and pruned', () => {
  const low = require('lowdb');
  const Memory = require('lowdb/adapters/Memory');
  const { authenticate, createSession } = require('../lib/session.cjs');
  const db = low(new Memory());
  db.defaults({ sessions: [] }).write();
  const { token } = createSession(db, 'user-001');
  const request = { get: () => ['Bearer', token].join(' ') };
  assert.equal(authenticate(db, request), 'user-001');
  db.get('sessions').find({ userId: 'user-001' }).assign({ expiresAt: new Date(Date.now() - 1000).toISOString() }).write();
  assert.equal(authenticate(db, request), null);
  createSession(db, 'user-002');
  assert.equal(db.get('sessions').size().value(), 1);
});

test('password reset revokes existing sessions', async () => {
  const email = 'sinhvien002@student.iuh.edu.vn';
  const { headers } = await loginAs(context.baseUrl, email);
  const requested = await postJson(context.baseUrl, '/auth/forgot-password', { email });
  const { resetCode } = await requested.json();
  const reset = await postJson(context.baseUrl, '/auth/reset-password', {
    email,
    resetCode,
    newPassword: 'Moi@12345',
  });
  assert.equal(reset.status, 200);
  assert.equal((await get('/auth/session', headers)).status, 401);
});

test('PATCH /users/:id only edits faculty, class and avatar of the signed-in user', async () => {
  const { headers, user } = await loginAs(context.baseUrl);
  const route = `/users/${user.id}`;

  assert.equal((await patch(route, { faculty: 'CNTT' })).status, 401);

  const other = await loginAs(context.baseUrl, 'moderator@student.iuh.edu.vn');
  assert.equal((await patch(route, { faculty: 'CNTT' }, other.headers)).status, 403);

  for (const body of [{}, { fullName: 'Hacker' }, { role: 'moderator' }, { email: 'a@b.c' }]) {
    assert.equal((await patch(route, body, headers)).status, 400, JSON.stringify(body));
  }
  assert.equal((await patch(route, { avatarUrl: 'https://evil.example/a.png' }, headers)).status, 400);
  assert.equal((await patch(route, { faculty: 'x'.repeat(101) }, headers)).status, 400);

  const updated = await patch(route, {
    faculty: ' Khoa CNTT ',
    className: 'DHKTPM17A',
    avatarUrl: `/uploads/${'a'.repeat(32)}.jpg`,
  }, headers);
  assert.equal(updated.status, 200);
  const profile = await updated.json();
  assert.equal(profile.faculty, 'Khoa CNTT');
  assert.equal(profile.className, 'DHKTPM17A');
  assert.equal(profile.role, 'student');
  assert.equal(typeof profile.reputation, 'number');

  const publicProfile = await (await get(`${route}/public`)).json();
  assert.equal(publicProfile.className, 'DHKTPM17A');
  assert.equal('email' in publicProfile, false);

  assert.equal((await fetch(`${context.baseUrl}${route}`, { method: 'PUT', headers })).status, 405);
  assert.equal((await fetch(`${context.baseUrl}${route}`, { method: 'DELETE', headers })).status, 405);
});

test('reputation counts completed exchanges and actioned reports', () => {
  const { computeUserStats } = require('../lib/reputation.cjs');
  const data = {
    items: [{ id: 'i1', ownerId: 'u1' }, { id: 'i2', ownerId: 'u2' }],
    appointments: [
      { itemId: 'i1', requesterId: 'u2', status: 'completed' },
      { itemId: 'i2', requesterId: 'u1', status: 'completed' },
      { itemId: 'i2', requesterId: 'u1', status: 'pending' },
    ],
    reports: [{ itemId: 'i1', status: 'actioned' }, { itemId: 'i1', status: 'pending' }],
  };
  const db = {
    get: (name) => require('lodash').chain(data[name]),
  };
  assert.deepEqual(computeUserStats(db, 'u1'), { successfulExchanges: 2, reputation: 50 });
  assert.deepEqual(computeUserStats(db, 'u2'), { successfulExchanges: 2, reputation: 60 });
});
