const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { after, before, test } = require('node:test');
const { removeOrphanUploads } = require('../lib/uploads.cjs');
const { loginAs, startTestServer } = require('./helpers.cjs');

let context;

before(async () => {
  context = await startTestServer();
});

after(async () => {
  await context?.close();
});

const JPEG = Buffer.from([0xff, 0xd8, 0xff, 0xe0, 0, 1, 2, 3]);
const PNG = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0, 0]);

const upload = (body, contentType, headers = {}) => fetch(`${context.baseUrl}/uploads`, {
  method: 'POST',
  headers: { 'Content-Type': contentType, ...headers },
  body,
});

test('upload requires a signed-in user', async () => {
  assert.equal((await upload(JPEG, 'image/jpeg')).status, 401);
});

test('jpeg and png uploads are stored under a random name and served back', async () => {
  const { headers } = await loginAs(context.baseUrl);
  for (const [body, type, extension] of [[JPEG, 'image/jpeg', 'jpg'], [PNG, 'image/png', 'png']]) {
    const response = await upload(body, type, headers);
    assert.equal(response.status, 201);
    const { url } = await response.json();
    assert.match(url, new RegExp(`^/uploads/[0-9a-f]{32}\\.${extension}$`));
    const served = await fetch(`${context.baseUrl}${url}`);
    assert.equal(served.status, 200);
    assert.deepEqual(Buffer.from(await served.arrayBuffer()), body);
  }
});

test('uploads reject wrong content, wrong type and oversized files', async () => {
  const { headers } = await loginAs(context.baseUrl);
  assert.equal((await upload(Buffer.from('<script>1</script>'), 'image/png', headers)).status, 415);
  assert.equal((await upload(JPEG, 'text/plain', headers)).status, 415);
  assert.equal((await upload(Buffer.alloc(0), 'image/png', headers)).status, 415);
  const big = Buffer.concat([JPEG, Buffer.alloc(5 * 1024 * 1024)]);
  assert.equal((await upload(big, 'image/jpeg', headers)).status, 413);
});

test('orphan cleanup keeps referenced and recent files', () => {
  const dir = fs.mkdtempSync(path.join(context.uploadsDir, '..', 'orphans-'));
  const make = (name, ageMs) => {
    const file = path.join(dir, name);
    fs.writeFileSync(file, JPEG);
    const time = new Date(Date.now() - ageMs);
    fs.utimesSync(file, time, time);
  };
  const kept = `${'1'.repeat(32)}.jpg`;
  const old = `${'2'.repeat(32)}.jpg`;
  const fresh = `${'3'.repeat(32)}.png`;
  make(kept, 2 * 3600 * 1000);
  make(old, 2 * 3600 * 1000);
  make(fresh, 1000);
  const removed = removeOrphanUploads(dir, [`/uploads/${kept}`]);
  assert.deepEqual(removed, [`/uploads/${old}`]);
  assert.deepEqual(fs.readdirSync(dir).sort(), [fresh, kept].sort());
});
