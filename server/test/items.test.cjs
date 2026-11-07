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
    location: 'Sảnh thư viện IUH',
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
    location: 'Sảnh thư viện IUH',
  });
  assert.equal(created.status, 201);
  assert.equal((await created.json()).status, 'available');

  const updated = await postJson(context.baseUrl, '/items/item-test', { status: 'reserved' }, 'PATCH');
  assert.equal(updated.status, 200);
  assert.equal((await updated.json()).status, 'reserved');
});

test('item API blocks editing and deleting exchanged items', async () => {
  const created = await postJson(context.baseUrl, '/items', {
    id: 'item-exchanged-test',
    ownerId: 'user-001',
    title: 'Món đã trao',
    description: 'Mô tả món đã trao',
    category: 'Sách',
    condition: 'good',
    imageUrl: '',
    location: 'Sảnh thư viện IUH',
  });
  assert.equal(created.status, 201);

  const exchanged = await postJson(
    context.baseUrl,
    '/items/item-exchanged-test',
    { status: 'exchanged' },
    'PATCH',
  );
  assert.equal(exchanged.status, 200);

  const blockedPatch = await postJson(
    context.baseUrl,
    '/items/item-exchanged-test',
    { title: 'Không được sửa' },
    'PATCH',
  );
  assert.equal(blockedPatch.status, 409);

  const blockedDelete = await postJson(
    context.baseUrl,
    '/items/item-exchanged-test',
    {},
    'DELETE',
  );
  assert.equal(blockedDelete.status, 409);
});
