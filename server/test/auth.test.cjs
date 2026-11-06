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

const login = (email, password) => postJson(context.baseUrl, '/auth/login', { email, password });

test('seeded accounts log in with the demo password only', async () => {
  const ok = await login('sinhvien001@student.iuh.edu.vn', 'Demo@1234');
  assert.equal(ok.status, 200);
  const session = await ok.json();
  assert.equal(session.user.id, 'user-001');
  assert.match(session.token, /^[0-9a-f]{64}$/);

  const wrong = await login('sinhvien001@student.iuh.edu.vn', 'Wrong@1234');
  assert.equal(wrong.status, 401);
  assert.equal((await wrong.json()).error.code, 'INVALID_CREDENTIALS');
});

test('unknown or malformed emails are reported separately', async () => {
  const unknown = await login('29999999.chuacotk@student.iuh.edu.vn', 'Demo@1234');
  assert.equal(unknown.status, 404);
  assert.equal((await unknown.json()).error.code, 'ACCOUNT_NOT_FOUND');

  const malformed = await login('abc@gmail.com', 'Demo@1234');
  assert.equal(malformed.status, 400);
});

test('register enforces email and password patterns and stores a hash only', async () => {
  const email = '24000001.tran-van@student.iuh.edu.vn';
  const badEmail = await postJson(context.baseUrl, '/auth/register', {
    email: 'tran@student.iuh.edu.vn',
    password: 'Abcd@1234',
  });
  assert.equal(badEmail.status, 400);

  for (const password of ['abcd@1234', 'ABCD@1234', 'Abcdefg@', 'Abcd1234', 'Ab@1 2345', 'Ab@1']) {
    const weak = await postJson(context.baseUrl, '/auth/register', { email, password });
    assert.equal(weak.status, 400, password);
  }

  const created = await postJson(context.baseUrl, '/auth/register', { email, password: 'Abcd@1234' });
  assert.equal(created.status, 201);
  const { token, user } = await created.json();
  assert.match(token, /^[0-9a-f]{64}$/);
  assert.equal(user.id, 'student-24000001');
  assert.equal(user.fullName, 'Tran Van');
  assert.equal('password' in user || 'passwordHash' in user, false);

  assert.equal((await login(email, 'Abcd@1234')).status, 200);
  assert.equal((await login(email, 'Demo@1234')).status, 401);

  const duplicate = await postJson(context.baseUrl, '/auth/register', { email, password: 'Abcd@1234' });
  assert.equal(duplicate.status, 409);

  const exposed = await fetch(`${context.baseUrl}/credentials`);
  assert.equal(exposed.status, 404);
});

test('forgot password issues a one-time code that resets the password', async () => {
  const email = '21036004.ha@student.iuh.edu.vn';
  const missing = await postJson(context.baseUrl, '/auth/forgot-password', {
    email: '29999998.khong@student.iuh.edu.vn',
  });
  assert.equal(missing.status, 404);

  const requested = await postJson(context.baseUrl, '/auth/forgot-password', { email });
  assert.equal(requested.status, 200);
  const { resetCode } = await requested.json();
  assert.match(resetCode, /^\d{6}$/);

  const wrongCode = await postJson(context.baseUrl, '/auth/reset-password', {
    email,
    resetCode: resetCode === '000000' ? '111111' : '000000',
    newPassword: 'Moi@12345',
  });
  assert.equal(wrongCode.status, 400);

  const weak = await postJson(context.baseUrl, '/auth/reset-password', {
    email,
    resetCode,
    newPassword: 'yeu',
  });
  assert.equal(weak.status, 400);

  const reset = await postJson(context.baseUrl, '/auth/reset-password', {
    email,
    resetCode,
    newPassword: 'Moi@12345',
  });
  assert.equal(reset.status, 200);
  assert.equal((await login(email, 'Moi@12345')).status, 200);
  assert.equal((await login(email, 'Demo@1234')).status, 401);

  const reused = await postJson(context.baseUrl, '/auth/reset-password', {
    email,
    resetCode,
    newPassword: 'Khac@12345',
  });
  assert.equal(reused.status, 400);
});
