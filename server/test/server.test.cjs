const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { after, before, test } = require('node:test');
const { createServer } = require('../server.cjs');

let server;
let baseUrl;
let tempDirectory;

before(async () => {
  tempDirectory = fs.mkdtempSync(path.join(os.tmpdir(), 'nhom18-json-server-'));
  const database = path.join(tempDirectory, 'db.json');
  fs.copyFileSync(path.join(__dirname, '..', 'db.json'), database);
  server = createServer(database);
  await new Promise((resolve) => {
    server = server.listen(0, '127.0.0.1', resolve);
  });
  baseUrl = `http://127.0.0.1:${server.address().port}`;
});

after(async () => {
  if (server) await new Promise((resolve, reject) => server.close((error) => (error ? reject(error) : resolve())));
  if (tempDirectory) fs.rmSync(tempDirectory, { recursive: true, force: true });
});

test('health endpoint identifies the local JSON Server demo', async () => {
  const response = await fetch(`${baseUrl}/health`);
  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), { status: 'ok', mode: 'json-server-demo' });
});

test('public user response excludes email and student ID', async () => {
  const response = await fetch(`${baseUrl}/users/user-001/public`);
  const user = await response.json();
  assert.equal(response.status, 200);
  assert.deepEqual(Object.keys(user).sort(), ['avatarUrl', 'fullName', 'id']);
});

test('seeded listing owners have profiles and new demo users reject extra fields', async () => {
  const seed = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'db.json'), 'utf8'));
  const knownUsers = new Set(seed.users.map((user) => user.id));
  assert.equal(seed.items.every((item) => knownUsers.has(item.ownerId)), true);
  assert.equal(
    seed.users.some((user) => (
      user.id === 'user-011'
      && user.email === '21036011.test@student.iuh.edu.vn'
      && user.role === 'student'
    )),
    true,
  );

  const invalid = await fetch(`${baseUrl}/users`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      id: 'student-12345678',
      email: '12345678.sinhvien@student.iuh.edu.vn',
      studentId: '12345678',
      fullName: 'Demo Student',
      avatarUrl: '',
      role: 'student',
      password: 'must-not-be-accepted',
    }),
  });
  assert.equal(invalid.status, 400);

  const created = await fetch(`${baseUrl}/users`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      id: 'student-12345678',
      email: '12345678.sinhvien@student.iuh.edu.vn',
      studentId: '12345678',
      fullName: 'Demo Student',
      avatarUrl: '',
      role: 'student',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }),
  });
  assert.equal(created.status, 201);
  assert.equal((await created.json()).id, 'student-12345678');
});

test('item CRUD validates prohibited terms and persists valid edits', async () => {
  const rejected = await fetch(`${baseUrl}/items`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      id: 'item-invalid',
      ownerId: 'user-001',
      title: 'Hàng cấm',
      description: 'Nội dung không phù hợp',
      category: 'Khác',
      condition: 'good',
      imageUrl: '',
    }),
  });
  assert.equal(rejected.status, 400);

  const created = await fetch(`${baseUrl}/items`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      id: 'item-test',
      ownerId: 'user-001',
      title: 'Sách kiểm thử',
      description: 'Sách còn sử dụng tốt.',
      category: 'Sách',
      condition: 'good',
      imageUrl: '',
      imageUrls: [],
    }),
  });
  assert.equal(created.status, 201);
  assert.equal((await created.json()).status, 'available');

  const updated = await fetch(`${baseUrl}/items/item-test`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status: 'reserved' }),
  });
  assert.equal(updated.status, 200);
  assert.equal((await updated.json()).status, 'reserved');
});

test('report API rejects invalid reasons', async () => {
  const response = await fetch(`${baseUrl}/reports`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      id: 'report-test',
      itemId: 'item-001',
      reporterId: 'user-001',
      reason: 'invalid',
      details: '',
    }),
  });
  assert.equal(response.status, 400);
});
