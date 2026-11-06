const assert = require('node:assert/strict');
const { after, before, test } = require('node:test');
const { loginAs, startTestServer } = require('./helpers.cjs');

let context;
let requester;
let owner;

before(async () => {
  context = await startTestServer();
  requester = await loginAs(context.baseUrl);
  owner = await loginAs(context.baseUrl, 'sinhvien002@student.iuh.edu.vn');
});

after(async () => {
  await context?.close();
});

function appointmentInput(itemId = 'item-002', scheduledAt = new Date(Date.now() + 7 * 86400000)) {
  return {
    itemId,
    requesterId: requester.user.id,
    date: `${String(scheduledAt.getDate()).padStart(2, '0')}/${String(
      scheduledAt.getMonth() + 1,
    ).padStart(2, '0')}/${scheduledAt.getFullYear()}`,
    time: `${String(scheduledAt.getHours()).padStart(2, '0')}:${String(
      scheduledAt.getMinutes(),
    ).padStart(2, '0')}`,
    scheduledAt: scheduledAt.toISOString(),
  };
}

function requestJson(token, route, body, method = 'POST') {
  return fetch(`${context.baseUrl}${route}`, {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      ...(body ? { 'Content-Type': 'application/json' } : {}),
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
}

test('creates an appointment with item location and a server-calculated reminder', async () => {
  const response = await requestJson(
    requester.token,
    '/appointments',
    { ...appointmentInput(), location: 'Client supplied location' },
  );
  assert.equal(response.status, 201);
  const appointment = await response.json();
  assert.equal(appointment.status, 'pending');
  assert.equal(appointment.location, 'Thư viện IUH');
  assert.deepEqual(appointment.confirmedBy, []);
  assert.equal(appointment.reminderMinutes, 60);
  assert.equal(
    Date.parse(appointment.reminderAt),
    Date.parse(appointment.scheduledAt) - 60 * 60 * 1000,
  );

  const itemResponse = await fetch(`${context.baseUrl}/items/item-002`);
  assert.equal((await itemResponse.json()).status, 'reserved');
  await requestJson(
    requester.token,
    `/appointments/${appointment.id}/status`,
    { status: 'cancelled' },
    'PATCH',
  );
});

test('requires a valid future date within the item availability window', async () => {
  for (const date of ['2099-11-06', '31/02/2099']) {
    const response = await requestJson(requester.token, '/appointments', {
      ...appointmentInput('item-004'),
      date,
    });
    assert.equal(response.status, 400);
  }
  const beyondAvailability = await requestJson(
    requester.token,
    '/appointments',
    appointmentInput('item-004', new Date('2027-03-01T10:00:00.000Z')),
  );
  assert.equal(beyondAvailability.status, 400);
});

test('requires both participants to confirm before completion', async () => {
  const createdResponse = await requestJson(
    requester.token,
    '/appointments',
    appointmentInput(),
  );
  const created = await createdResponse.json();
  const requesterConfirmation = await requestJson(
    requester.token,
    `/appointments/${created.id}/status`,
    { status: 'confirmed' },
    'PATCH',
  );
  assert.deepEqual((await requesterConfirmation.json()).confirmedBy, [requester.user.id]);

  const prematureCompletion = await requestJson(
    owner.token,
    `/appointments/${created.id}/status`,
    { status: 'completed' },
    'PATCH',
  );
  assert.equal(prematureCompletion.status, 409);

  const ownerConfirmation = await requestJson(
    owner.token,
    `/appointments/${created.id}/status`,
    { status: 'confirmed' },
    'PATCH',
  );
  assert.deepEqual(
    (await ownerConfirmation.json()).confirmedBy.sort(),
    [owner.user.id, requester.user.id].sort(),
  );

  const completedResponse = await requestJson(
    owner.token,
    `/appointments/${created.id}/status`,
    { status: 'completed' },
    'PATCH',
  );
  const completed = await completedResponse.json();
  assert.equal(completed.status, 'completed');
  assert.equal(completed.reminderAt, null);
  const itemResponse = await fetch(`${context.baseUrl}/items/item-002`);
  assert.equal((await itemResponse.json()).status, 'exchanged');
});

test('cancelling an appointment releases the reserved item and clears its reminder', async () => {
  const createdResponse = await requestJson(
    requester.token,
    '/appointments',
    appointmentInput('item-004'),
  );
  const created = await createdResponse.json();
  const response = await requestJson(
    requester.token,
    `/appointments/${created.id}/status`,
    { status: 'cancelled' },
    'PATCH',
  );
  assert.equal(response.status, 200);
  assert.equal((await response.json()).reminderAt, null);

  const itemResponse = await fetch(`${context.baseUrl}/items/item-004`);
  assert.equal((await itemResponse.json()).status, 'available');
});

test('appointment reads require a session and are scoped to that user', async () => {
  assert.equal((await fetch(`${context.baseUrl}/appointments`)).status, 401);
  assert.equal(
    (await requestJson(requester.token, '/appointments?userId=user-002', undefined, 'GET')).status,
    403,
  );
  const createdResponse = await requestJson(
    requester.token,
    '/appointments',
    appointmentInput('item-004'),
  );
  const appointment = await createdResponse.json();
  assert.equal((await fetch(`${context.baseUrl}/appointments/${appointment.id}`)).status, 401);
  assert.equal(
    (await requestJson(
      owner.token,
      `/appointments/${appointment.id}`,
      undefined,
      'GET',
    )).status,
    403,
  );
  assert.equal(
    (await requestJson(
      requester.token,
      `/appointments/${appointment.id}`,
      undefined,
      'GET',
    )).status,
    200,
  );
  assert.equal(
    (await requestJson(
      requester.token,
      `/appointments/${appointment.id}`,
      { status: 'confirmed' },
      'PATCH',
    )).status,
    405,
  );
});
