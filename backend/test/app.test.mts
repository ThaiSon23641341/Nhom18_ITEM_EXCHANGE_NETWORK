import assert from 'node:assert/strict';
import { once } from 'node:events';
import { after, before, beforeEach, describe, it } from 'node:test';
import type { AddressInfo } from 'node:net';
import { app } from '../src/app.js';
import { demoStore } from '../src/demoStore.js';

const server = app.listen(0, '127.0.0.1');
await once(server, 'listening');

const address = server.address() as AddressInfo;
const baseUrl = `http://127.0.0.1:${address.port}/api/v1`;

const request = async (path: string, init?: RequestInit): Promise<Response> =>
  fetch(`${baseUrl}${path}`, {
    ...init,
    headers: {
      ...(init?.body ? { 'content-type': 'application/json' } : {}),
      ...init?.headers,
    },
  });

const json = (body: unknown): string => JSON.stringify(body);

before(() => demoStore.reset());
beforeEach(() => demoStore.reset());
after(() => server.close());

describe('sample REST API', () => {
  it('reports that the API uses in-memory demo data without a database connection', async () => {
    const response = await request('/health');
    assert.equal(response.status, 200);
    assert.deepEqual(await response.json(), {
      status: 'ok',
      mode: 'in-memory-demo',
    });
  });

  it('lists items with pagination and filters', async () => {
    const response = await request('/items?category=Gi%C3%A1o%20tr%C3%ACnh&status=available&page=1&limit=1');
    const body = await response.json();
    assert.equal(response.status, 200);
    assert.equal(body.data.total, 1);
    assert.equal(body.data.data[0].id, 'item-001');
    assert.equal(body.data.hasMore, false);
  });

  it('returns a public profile without contact or student identifiers', async () => {
    const response = await request('/users/user-001/public');
    const body = await response.json();
    assert.equal(response.status, 200);
    assert.deepEqual(body.data, {
      id: 'user-001',
      fullName: 'Nguyen Minh Anh',
      avatarUrl: '',
    });
  });

  it('creates and updates an item while rejecting prohibited content', async () => {
    const createResponse = await request('/items', {
      method: 'POST',
      body: json({
        ownerId: 'user-001',
        title: 'Giao trinh Java',
        description: 'Sach con tot',
        category: 'Giao trinh',
        condition: 'good',
        imageUrl: '',
      }),
    });
    const created = await createResponse.json();
    assert.equal(createResponse.status, 201);
    assert.equal(created.data.status, 'available');

    const updateResponse = await request(`/items/${created.data.id}`, {
      method: 'PATCH',
      body: json({ status: 'reserved' }),
    });
    assert.equal(updateResponse.status, 200);
    assert.equal((await updateResponse.json()).data.status, 'reserved');

    const blockedResponse = await request('/items', {
      method: 'POST',
      body: json({
        ownerId: 'user-001',
        title: 'Lừa đảo',
        description: 'Mo ta',
        category: 'Khac',
        condition: 'good',
      }),
    });
    assert.equal(blockedResponse.status, 400);
    assert.equal((await blockedResponse.json()).error.code, 'PROHIBITED_CONTENT');
  });

  it('rejects invalid item status transitions', async () => {
    const response = await request('/items/item-001', {
      method: 'PATCH',
      body: json({ status: 'available' }),
    });
    assert.equal(response.status, 200);

    const exchangedResponse = await request('/items/item-001', {
      method: 'PATCH',
      body: json({ status: 'exchanged' }),
    });
    assert.equal(exchangedResponse.status, 200);

    const invalidResponse = await request('/items/item-001', {
      method: 'PATCH',
      body: json({ status: 'available' }),
    });
    assert.equal(invalidResponse.status, 409);
  });

  it('creates an appointment and updates item state when cancelled', async () => {
    const createResponse = await request('/appointments', {
      method: 'POST',
      body: json({
        itemId: 'item-001',
        requesterId: 'user-002',
        date: '2026-11-02',
        time: '10:30',
        location: 'Thu vien IUH',
      }),
    });
    const created = await createResponse.json();
    assert.equal(createResponse.status, 201);
    assert.equal(created.data.status, 'pending');
    assert.equal((await request('/items/item-001').then((r) => r.json())).data.status, 'reserved');

    const cancelResponse = await request(
      `/appointments/${created.data.id}/status`,
      {
        method: 'PATCH',
        body: json({ status: 'cancelled' }),
      },
    );
    assert.equal(cancelResponse.status, 200);
    assert.equal((await request('/items/item-001').then((r) => r.json())).data.status, 'available');
  });

  it('rejects appointment requests for unavailable or owned items', async () => {
    const ownItem = await request('/appointments', {
      method: 'POST',
      body: json({
        itemId: 'item-001',
        requesterId: 'user-001',
        date: '2026-11-02',
        time: '10:30',
        location: 'Thu vien IUH',
      }),
    });
    assert.equal(ownItem.status, 400);

    const reservedItem = await request('/appointments', {
      method: 'POST',
      body: json({
        itemId: 'item-003',
        requesterId: 'user-002',
        date: '2026-11-02',
        time: '10:30',
        location: 'Thu vien IUH',
      }),
    });
    assert.equal(reservedItem.status, 409);

    const invalidDate = await request('/appointments', {
      method: 'POST',
      body: json({
        itemId: 'item-001',
        requesterId: 'user-002',
        date: '2026-02-31',
        time: '10:30',
        location: 'Thu vien IUH',
      }),
    });
    assert.equal(invalidDate.status, 400);
  });

  it('creates a report and resolves its status', async () => {
    const createResponse = await request('/reports', {
      method: 'POST',
      body: json({
        itemId: 'item-001',
        reporterId: 'user-002',
        reason: 'suspected_scam',
        details: 'Can kiem tra tin dang.',
      }),
    });
    const created = await createResponse.json();
    assert.equal(createResponse.status, 201);

    const resolveResponse = await request(
      `/reports/${created.data.id}/status`,
      {
        method: 'PATCH',
        body: json({ status: 'actioned' }),
      },
    );
    assert.equal(resolveResponse.status, 200);
    assert.equal((await resolveResponse.json()).data.status, 'actioned');
  });

  it('returns consistent errors for invalid input and missing routes', async () => {
    const invalidPagination = await request('/items?page=0');
    assert.equal(invalidPagination.status, 400);
    assert.equal((await invalidPagination.json()).error.code, 'BAD_REQUEST');

    const missingRoute = await request('/missing');
    assert.equal(missingRoute.status, 404);
    assert.equal((await missingRoute.json()).error.code, 'NOT_FOUND');
  });
});
