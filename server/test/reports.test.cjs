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

test('report API rejects invalid reasons', async () => {
  const response = await postJson(context.baseUrl, '/reports', {
    id: 'report-test',
    itemId: 'item-001',
    reporterId: 'user-001',
    reason: 'invalid',
    details: '',
  });
  assert.equal(response.status, 400);
});
