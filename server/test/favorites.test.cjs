const assert = require('node:assert/strict');
const { after, before, describe, test } = require('node:test');
const { postJson, startTestServer } = require('./helpers.cjs');

const request = (baseUrl, route, init) => fetch(`${baseUrl}${route}`, init);

describe('favorites API', () => {
  let context;

  before(async () => {
    context = await startTestServer();
  });

  after(async () => {
    await context?.close();
  });

  test('filters by user, prevents duplicates, and removes favorites', async () => {
    const created = await postJson(context.baseUrl, '/favorites', {
      userId: '21036001',
      itemId: 'item-001',
    });
    assert.equal(created.status, 201);
    const favorite = await created.json();
    assert.equal(favorite.userId, 'user-001');
    assert.equal(favorite.itemId, 'item-001');
    assert.ok(favorite.id);
    assert.ok(favorite.createdAt);

    const duplicate = await postJson(context.baseUrl, '/favorites', {
      userId: 'user-001',
      itemId: 'item-001',
    });
    assert.equal(duplicate.status, 409);

    const favorites = await request(context.baseUrl, '/favorites?userId=21036001');
    assert.equal(favorites.status, 200);
    assert.deepEqual(await favorites.json(), [favorite]);

    const otherUserFavorites = await request(context.baseUrl, '/favorites?userId=user-002');
    assert.deepEqual(await otherUserFavorites.json(), []);

    const removed = await request(context.baseUrl, `/favorites/${favorite.id}`, { method: 'DELETE' });
    assert.equal(removed.status, 200);
    const afterRemoval = await request(context.baseUrl, '/favorites?userId=user-001');
    assert.deepEqual(await afterRemoval.json(), []);
  });

  test('rejects invalid identifiers and missing resources', async () => {
    const missingUserId = await request(context.baseUrl, '/favorites');
    assert.equal(missingUserId.status, 400);

    const unknownUser = await postJson(context.baseUrl, '/favorites', {
      userId: 'user-missing',
      itemId: 'item-001',
    });
    assert.equal(unknownUser.status, 404);

    const unknownItem = await postJson(context.baseUrl, '/favorites', {
      userId: 'user-001',
      itemId: 'item-missing',
    });
    assert.equal(unknownItem.status, 404);

    const unknownFavorite = await request(context.baseUrl, '/favorites/favorite-missing', { method: 'DELETE' });
    assert.equal(unknownFavorite.status, 404);
  });

});
