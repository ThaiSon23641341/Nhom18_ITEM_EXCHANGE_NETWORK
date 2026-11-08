const assert = require('node:assert/strict');
const { after, before, test } = require('node:test');
const { loginAs, startTestServer } = require('./helpers.cjs');

let context;
let requester;
let owner;
let other;

before(async () => {
  context = await startTestServer();
  requester = await loginAs(context.baseUrl);
  owner = await loginAs(context.baseUrl, 'sinhvien002@student.iuh.edu.vn');
  other = await loginAs(context.baseUrl, '21036004.ha@student.iuh.edu.vn');
});

after(async () => {
  await context?.close();
});

function appointmentInput(itemId = 'item-default', scheduledAt = new Date(Date.now() + 7 * 86400000)) {
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

async function createAvailableItem(itemId, location = 'Thư viện IUH') {
  const response = await requestJson(owner.token, '/items', {
    id: itemId,
    ownerId: owner.user.id,
    title: `Món kiểm thử ${itemId}`,
    description: 'Món kiểm thử cho lịch hẹn.',
    category: 'Khác',
    condition: 'good',
    imageUrl: '',
    location,
  });
  assert.equal(response.status, 201, await response.text());
}

async function createConfirmedAppointment(itemId) {
  await createAvailableItem(itemId);
  const createdResponse = await requestJson(
    requester.token,
    '/appointments',
    appointmentInput(itemId),
  );
  assert.equal(createdResponse.status, 201);
  const appointment = await createdResponse.json();
  for (const token of [requester.token, owner.token]) {
    const confirmation = await requestJson(
      token,
      `/appointments/${appointment.id}/status`,
      { status: 'confirmed' },
      'PATCH',
    );
    assert.equal(confirmation.status, 200);
  }
  return appointment.id;
}

async function deliverAppointment(appointmentId) {
  return requestJson(
    owner.token,
    `/appointments/${appointmentId}/completion`,
    { action: 'delivered' },
    'PATCH',
  );
}

test('creates an appointment with item location and a server-calculated reminder', async () => {
  await createAvailableItem('item-reminder-create', 'Thư viện IUH');
  const response = await requestJson(
    requester.token,
    '/appointments',
    { ...appointmentInput('item-reminder-create'), location: 'Client supplied location' },
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

  const itemResponse = await fetch(`${context.baseUrl}/items/item-reminder-create`);
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
      ...appointmentInput('item-012'),
      date,
    });
    assert.equal(response.status, 400);
  }
  const beyondAvailability = await requestJson(
    requester.token,
    '/appointments',
    appointmentInput('item-012', new Date('2027-03-01T10:00:00.000Z')),
  );
  assert.equal(beyondAvailability.status, 400);
});

test('requires both appointment confirmations and receiver confirmation to complete', async () => {
  await createAvailableItem('item-completion-test');
  const createdResponse = await requestJson(
    requester.token,
    '/appointments',
    appointmentInput('item-completion-test'),
  );
  const created = await createdResponse.json();
  assert.deepEqual(created.completionConfirmedBy, []);
  const nonParticipantDelivery = await requestJson(
    other.token,
    `/appointments/${created.id}/completion`,
    { action: 'delivered' },
    'PATCH',
  );
  assert.equal(nonParticipantDelivery.status, 403);
  const prematureDelivery = await deliverAppointment(created.id);
  assert.equal(prematureDelivery.status, 409);

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

  const editAfterBothConfirmed = await requestJson(
    requester.token,
    `/appointments/${created.id}`,
    { date: '08/11/2026', time: '10:00' },
    'PATCH',
  );
  assert.equal(editAfterBothConfirmed.status, 409);

  const requesterProfileBefore = await fetch(
    `${context.baseUrl}/users/${requester.user.id}/public`,
  ).then((response) => response.json());
  const ownerProfileBefore = await fetch(
    `${context.baseUrl}/users/${owner.user.id}/public`,
  ).then((response) => response.json());
  const ownerCannotCompleteAlone = await requestJson(
    owner.token,
    `/appointments/${created.id}/status`,
    { status: 'completed' },
    'PATCH',
  );
  assert.equal(ownerCannotCompleteAlone.status, 409);

  const requesterCannotConfirmDelivery = await requestJson(
    requester.token,
    `/appointments/${created.id}/completion`,
    { action: 'delivered' },
    'PATCH',
  );
  assert.equal(requesterCannotConfirmDelivery.status, 403);
  const prematureReceipt = await requestJson(
    requester.token,
    `/appointments/${created.id}/completion`,
    { action: 'received' },
    'PATCH',
  );
  assert.equal(prematureReceipt.status, 409);

  const deliveryResponses = await Promise.all([
    deliverAppointment(created.id),
    deliverAppointment(created.id),
  ]);
  assert.deepEqual(deliveryResponses.map((response) => response.status), [200, 200]);
  const delivered = await deliveryResponses[0].json();
  assert.equal(delivered.status, 'confirmed');
  assert.deepEqual(delivered.completionConfirmedBy, [owner.user.id]);
  const reservedItem = await fetch(`${context.baseUrl}/items/item-completion-test`)
    .then((response) => response.json());
  assert.equal(reservedItem.status, 'reserved');

  const receiptResponses = await Promise.all([
    requestJson(
      requester.token,
      `/appointments/${created.id}/completion`,
      { action: 'received' },
      'PATCH',
    ),
    requestJson(
      requester.token,
      `/appointments/${created.id}/completion`,
      { action: 'received' },
      'PATCH',
    ),
  ]);
  assert.deepEqual(receiptResponses.map((response) => response.status), [200, 200]);
  const completed = await receiptResponses[0].json();
  assert.equal(completed.status, 'completed');
  assert.deepEqual(
    completed.completionConfirmedBy.sort(),
    [owner.user.id, requester.user.id].sort(),
  );
  assert.equal(completed.reminderAt, null);
  const requesterProfileAfter = await fetch(
    `${context.baseUrl}/users/${requester.user.id}/public`,
  ).then((response) => response.json());
  const ownerProfileAfter = await fetch(
    `${context.baseUrl}/users/${owner.user.id}/public`,
  ).then((response) => response.json());
  assert.equal(
    requesterProfileAfter.successfulExchanges,
    requesterProfileBefore.successfulExchanges + 1,
  );
  assert.equal(
    ownerProfileAfter.successfulExchanges,
    ownerProfileBefore.successfulExchanges + 1,
  );
  const itemResponse = await fetch(`${context.baseUrl}/items/item-completion-test`);
  assert.equal((await itemResponse.json()).status, 'exchanged');
  const cancelAfterCompletion = await requestJson(
    owner.token,
    `/appointments/${created.id}/status`,
    { status: 'cancelled', reason: 'Đã hoàn tất' },
    'PATCH',
  );
  assert.equal(cancelAfterCompletion.status, 409);
});

test('recipient can cancel before delivery without a penalty', async () => {
  const appointmentId = await createConfirmedAppointment('item-cancel-before-delivery');
  const response = await requestJson(
    requester.token,
    `/appointments/${appointmentId}/status`,
    { status: 'cancelled' },
    'PATCH',
  );
  assert.equal(response.status, 200);
  const cancelled = await response.json();
  assert.equal(cancelled.reminderAt, null);
  assert.equal(cancelled.cancelledBy, requester.user.id);
  assert.equal(cancelled.cancellationPenalized, false);
  assert.equal(cancelled.cancellationReason, null);

  const itemResponse = await fetch(`${context.baseUrl}/items/item-cancel-before-delivery`);
  assert.equal((await itemResponse.json()).status, 'available');
});

test('owner can cancel a confirmed appointment before delivery without a penalty', async () => {
  const appointmentId = await createConfirmedAppointment('item-owner-cancel-before-delivery');
  const response = await requestJson(
    owner.token,
    `/appointments/${appointmentId}/status`,
    { status: 'cancelled' },
    'PATCH',
  );
  assert.equal(response.status, 200);
  const cancelled = await response.json();
  assert.equal(cancelled.cancelledBy, owner.user.id);
  assert.equal(cancelled.cancellationPenalized, false);
  assert.equal(
    (await fetch(`${context.baseUrl}/items/item-owner-cancel-before-delivery`)
      .then((itemResponse) => itemResponse.json())).status,
    'available',
  );
});

test('post-delivery cancellation records server-derived escalating penalties', async () => {
  const firstAppointmentId = await createConfirmedAppointment('item-penalty-owner-1');
  assert.equal((await deliverAppointment(firstAppointmentId)).status, 200);
  const missingReason = await requestJson(
    owner.token,
    `/appointments/${firstAppointmentId}/status`,
    { status: 'cancelled' },
    'PATCH',
  );
  assert.equal(missingReason.status, 400);
  const forgedPenalty = await requestJson(
    owner.token,
    `/appointments/${firstAppointmentId}/status`,
    {
      status: 'cancelled',
      reason: 'Ngừng giao dịch',
      cancelledBy: requester.user.id,
      cancellationPenalized: false,
    },
    'PATCH',
  );
  assert.equal(forgedPenalty.status, 400);

  const firstCancellationResponses = await Promise.all([
    requestJson(
      owner.token,
      `/appointments/${firstAppointmentId}/status`,
      { status: 'cancelled', reason: 'Ngừng giao dịch' },
      'PATCH',
    ),
    requestJson(
      owner.token,
      `/appointments/${firstAppointmentId}/status`,
      { status: 'cancelled', reason: 'Ngừng giao dịch' },
      'PATCH',
    ),
  ]);
  assert.deepEqual(firstCancellationResponses.map((response) => response.status), [200, 200]);
  const firstCancellation = await firstCancellationResponses[0].json();
  assert.equal(firstCancellation.cancelledBy, owner.user.id);
  assert.equal(firstCancellation.cancellationReason, 'Ngừng giao dịch');
  assert.equal(firstCancellation.cancellationPenalized, true);
  assert.equal(firstCancellation.cancellationPenaltyCount, 1);
  assert.equal(firstCancellation.cancellationPenaltyPoints, 5);
  assert.equal(
    (await fetch(`${context.baseUrl}/items/item-penalty-owner-1`)
      .then((response) => response.json())).status,
    'available',
  );

  const secondAppointmentId = await createConfirmedAppointment('item-penalty-owner-2');
  assert.equal((await deliverAppointment(secondAppointmentId)).status, 200);
  const secondResponse = await requestJson(
    owner.token,
    `/appointments/${secondAppointmentId}/status`,
    { status: 'cancelled', reason: 'Không thể tiếp tục' },
    'PATCH',
  );
  assert.equal(secondResponse.status, 200);
  const secondCancellation = await secondResponse.json();
  assert.equal(secondCancellation.cancellationPenaltyCount, 2);
  assert.equal(secondCancellation.cancellationPenaltyPoints, 7.5);
});

test('recipient cancellation after delivery requires a reason and keeps the item reserved', async () => {
  const appointmentId = await createConfirmedAppointment('item-cancel-after-delivery');
  assert.equal((await deliverAppointment(appointmentId)).status, 200);
  const response = await requestJson(
    requester.token,
    `/appointments/${appointmentId}/status`,
    { status: 'cancelled', reason: 'Không thể đến nhận' },
    'PATCH',
  );
  assert.equal(response.status, 200);
  const cancelled = await response.json();
  assert.equal(cancelled.cancelledBy, requester.user.id);
  assert.equal(cancelled.cancellationPenalized, true);
  assert.equal(cancelled.cancellationPenaltyPoints, 5);
  assert.equal(
    (await fetch(`${context.baseUrl}/items/item-cancel-after-delivery`)
      .then((itemResponse) => itemResponse.json())).status,
    'reserved',
  );
});

test('only one participant can win concurrent post-delivery cancellation', async () => {
  const appointmentId = await createConfirmedAppointment('item-cancel-race');
  assert.equal((await deliverAppointment(appointmentId)).status, 200);
  const responses = await Promise.all([
    requestJson(
      owner.token,
      `/appointments/${appointmentId}/status`,
      { status: 'cancelled', reason: 'Chủ món hủy' },
      'PATCH',
    ),
    requestJson(
      requester.token,
      `/appointments/${appointmentId}/status`,
      { status: 'cancelled', reason: 'Người nhận hủy' },
      'PATCH',
    ),
  ]);
  const statuses = responses.map((response) => response.status).sort();
  assert.deepEqual(statuses, [200, 409]);
  const appointment = await requestJson(
    owner.token,
    `/appointments/${appointmentId}`,
    undefined,
    'GET',
  ).then((response) => response.json());
  const item = await fetch(`${context.baseUrl}/items/item-cancel-race`)
    .then((response) => response.json());
  assert.equal(appointment.status, 'cancelled');
  assert.equal(appointment.cancellationPenalized, true);
  assert.equal(item.status, appointment.cancelledBy === owner.user.id ? 'available' : 'reserved');
});

test('appointment reads require a session and are scoped to that user', async () => {
  assert.equal((await fetch(`${context.baseUrl}/appointments`)).status, 401);
  assert.equal(
    (await requestJson(requester.token, '/appointments?userId=user-002', undefined, 'GET')).status,
    403,
  );
  await createAvailableItem('item-private-appointment-test');
  const createdResponse = await requestJson(
    requester.token,
    '/appointments',
    appointmentInput('item-private-appointment-test'),
  );
  const appointment = await createdResponse.json();
  assert.equal((await fetch(`${context.baseUrl}/appointments/${appointment.id}`)).status, 401);
  assert.equal(
    (await requestJson(
      other.token,
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
