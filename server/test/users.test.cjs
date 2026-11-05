const assert = require('node:assert/strict');
const { after, before, test } = require('node:test');
const { postJson, startTestServer } = require('./helpers.cjs');

let context;

before(async () => {
  context = await startTestServer();
});

after(async () => {
  await context?.close();
});

test('health endpoint identifies the local JSON Server demo', async () => {
  const response = await fetch(`${context.baseUrl}/health`);
  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), { status: 'ok', mode: 'json-server-demo' });
});

test('public user response excludes email and student ID', async () => {
  const response = await fetch(`${context.baseUrl}/users/user-001/public`);
  const user = await response.json();
  assert.equal(response.status, 200);
  assert.deepEqual(Object.keys(user).sort(), ['avatarUrl', 'fullName', 'id']);
});

test('seeded listing owners have profiles and new demo users reject extra fields', async () => {
  const knownUsers = new Set(context.seed.users.map((user) => user.id));
  assert.equal(context.seed.items.every((item) => knownUsers.has(item.ownerId)), true);
  assert.equal(
    context.seed.users.some((user) => (
      user.id === 'user-011'
      && user.email === '21036011.test@student.iuh.edu.vn'
      && user.role === 'student'
    )),
    true,
  );

  const demoUser = {
    id: 'student-12345678',
    email: '12345678.sinhvien@student.iuh.edu.vn',
    studentId: '12345678',
    fullName: 'Demo Student',
    avatarUrl: '',
    role: 'student',
  };
  const invalid = await postJson(context.baseUrl, '/users', {
    ...demoUser,
    password: 'must-not-be-accepted',
  });
  assert.equal(invalid.status, 400);

  const created = await postJson(context.baseUrl, '/users', {
    ...demoUser,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });
  assert.equal(created.status, 201);
  assert.equal((await created.json()).id, 'student-12345678');
});

test('seed database exposes every collection the route files rely on', () => {
  for (const collection of ['users', 'items', 'reports', 'appointments', 'favorites']) {
    assert.equal(Array.isArray(context.seed[collection]), true, collection);
  }
});
