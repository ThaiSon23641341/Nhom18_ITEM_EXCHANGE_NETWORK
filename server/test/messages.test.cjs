const assert = require('node:assert/strict');
const { after, before, test } = require('node:test');
const { loginAs, startTestServer } = require('./helpers.cjs');

let context;
let requester;
let owner;
let otherOwner;
let outsider;

before(async () => {
  context = await startTestServer();
  requester = await loginAs(context.baseUrl);
  owner = await loginAs(context.baseUrl, 'sinhvien002@student.iuh.edu.vn');
  otherOwner = await loginAs(context.baseUrl, '21036004.ha@student.iuh.edu.vn');
  outsider = await loginAs(context.baseUrl, 'moderator@student.iuh.edu.vn');
});

after(async () => {
  await context?.close();
});

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

function appointmentInput(itemId) {
  const scheduledAt = new Date(Date.now() + 5 * 86400000);
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

async function createAppointment(itemId) {
  const response = await requestJson(
    requester.token,
    '/appointments',
    appointmentInput(itemId),
  );
  assert.equal(response.status, 201);
  return response.json();
}

async function confirmAs(token, appointmentId) {
  return requestJson(
    token,
    `/appointments/${appointmentId}/status`,
    { status: 'confirmed' },
    'PATCH',
  );
}

test('chat requires both confirmations, is isolated by appointment, and becomes read-only', async () => {
  const firstAppointment = await createAppointment('item-002');
  assert.equal(
    (await fetch(`${context.baseUrl}/appointments/${firstAppointment.id}/messages`)).status,
    401,
  );
  assert.equal(
    (await requestJson(
      requester.token,
      `/appointments/${firstAppointment.id}/messages`,
      undefined,
      'GET',
    )).status,
    409,
  );
  assert.equal((await confirmAs(requester.token, firstAppointment.id)).status, 200);
  assert.equal(
    (await requestJson(
      requester.token,
      `/appointments/${firstAppointment.id}/messages`,
      undefined,
      'GET',
    )).status,
    409,
  );
  assert.equal((await confirmAs(owner.token, firstAppointment.id)).status, 200);

  assert.equal(
    (await requestJson(
      outsider.token,
      `/appointments/${firstAppointment.id}/messages`,
      undefined,
      'GET',
    )).status,
    403,
  );
  const sent = await requestJson(
    requester.token,
    `/appointments/${firstAppointment.id}/messages`,
    { text: 'Xin chào, mình sẽ đến đúng giờ.' },
  );
  assert.equal(sent.status, 201);
  const firstMessage = await sent.json();
  assert.equal(firstMessage.senderId, requester.user.id);
  assert.equal(firstMessage.appointmentId, firstAppointment.id);
  assert.equal((await fetch(`${context.baseUrl}/messages`)).status, 404);
  assert.equal((await fetch(`${context.baseUrl}/messages/${firstMessage.id}`)).status, 404);

  const secondAppointment = await createAppointment('item-004');
  assert.equal((await confirmAs(requester.token, secondAppointment.id)).status, 200);
  assert.equal((await confirmAs(otherOwner.token, secondAppointment.id)).status, 200);
  assert.equal(
    (await requestJson(
      otherOwner.token,
      `/appointments/${secondAppointment.id}/messages`,
      { text: 'Cuộc chat khác.' },
    )).status,
    201,
  );

  const firstMessages = await requestJson(
    owner.token,
    `/appointments/${firstAppointment.id}/messages`,
    undefined,
    'GET',
  );
  const firstConversation = await firstMessages.json();
  assert.equal(firstConversation.length, 1);
  assert.equal(firstConversation[0].appointmentId, firstAppointment.id);

  assert.equal(
    (await requestJson(
      requester.token,
      `/appointments/${firstAppointment.id}/status`,
      { status: 'cancelled' },
      'PATCH',
    )).status,
    200,
  );
  assert.equal(
    (await requestJson(
      requester.token,
      `/appointments/${firstAppointment.id}/messages`,
      { text: 'Tin nhắn sau khi hủy' },
    )).status,
    409,
  );
  const closedMessages = await requestJson(
    requester.token,
    `/appointments/${firstAppointment.id}/messages`,
    undefined,
    'GET',
  );
  assert.equal(closedMessages.status, 200);
  assert.equal((await closedMessages.json()).length, 1);
});
