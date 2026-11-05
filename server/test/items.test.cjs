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

test('item CRUD validates prohibited terms and persists valid edits', async () => {
  const rejected = await postJson(context.baseUrl, '/items', {
    id: 'item-invalid',
    ownerId: 'user-001',
    title: 'Hàng cấm',
    description: 'Nội dung không phù hợp',
    category: 'Khác',
    condition: 'good',
    imageUrl: '',
  });
  assert.equal(rejected.status, 400);

  const created = await postJson(context.baseUrl, '/items', {
    id: 'item-test',
    ownerId: 'user-001',
    title: 'Sách kiểm thử',
    description: 'Sách còn sử dụng tốt.',
    category: 'Sách',
    condition: 'good',
    imageUrl: '',
    imageUrls: [],
  });
  assert.equal(created.status, 201);
  assert.equal((await created.json()).status, 'available');

  const updated = await postJson(context.baseUrl, '/items/item-test', { status: 'reserved' }, 'PATCH');
  assert.equal(updated.status, 200);
  assert.equal((await updated.json()).status, 'reserved');
});
