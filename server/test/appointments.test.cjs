const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { after, before, test } = require('node:test');
const { createServer } = require('../server.cjs');

let server;
let baseUrl;
let tempDirectory;

const futureAppointment = {
  itemId: 'item-002',
  requesterId: 'user-001',
  date: '06/11/2099',
  time: '10:00',
  location: 'Sảnh thư viện IUH',
};

before(async () => {
  tempDirectory = fs.mkdtempSync(path.join(os.tmpdir(), 'nhom18-appointments-'));
  const database = path.join(tempDirectory, 'db.json');
  fs.copyFileSync(path.join(__dirname, '..', 'db.json'), database);
  server = createServer(database);
  await new Promise((resolve) => {
    server = server.listen(0, '127.0.0.1', resolve);
  });
  baseUrl = `http://127.0.0.1:${server.address().port}`;
});

after(async () => {
  if (server) await new Promise((resolve, reject) => server.close((error) => (
    error ? reject(error) : resolve()
  )));
  if (tempDirectory) fs.rmSync(tempDirectory, { recursive: true, force: true });
});

test('creates an appointment and reserves the item once', async () => {
  const response = await fetch(`${baseUrl}/appointments`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(futureAppointment),
  });
  assert.equal(response.status, 201);
  assert.equal((await response.json()).status, 'pending');

  const itemResponse = await fetch(`${baseUrl}/items/item-002`);
  assert.equal((await itemResponse.json()).status, 'reserved');
});

test('rejects ISO dates and impossible dates', async () => {
  for (const date of ['2099-11-06', '31/02/2099']) {
    const response = await fetch(`${baseUrl}/appointments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...futureAppointment, itemId: 'item-004', date }),
    });
    assert.equal(response.status, 400);
  }
});

test('cancelling an appointment releases the reserved item', async () => {
  const createdResponse = await fetch(`${baseUrl}/appointments`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...futureAppointment, itemId: 'item-004' }),
  });
  const created = await createdResponse.json();
  const response = await fetch(`${baseUrl}/appointments/${created.id}/status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status: 'cancelled' }),
  });
  assert.equal(response.status, 200);

  const itemResponse = await fetch(`${baseUrl}/items/item-004`);
  assert.equal((await itemResponse.json()).status, 'available');
});
