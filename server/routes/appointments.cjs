// Owner: Tú. Dates are dd/mm/yyyy and times are HH:mm.
const { isRecord, isText, sendError } = require('../lib/helpers.cjs');

const APPOINTMENT_STATUSES = ['pending', 'confirmed', 'cancelled', 'completed'];
const APPOINTMENT_FIELDS = new Set([
  'id', 'itemId', 'requesterId', 'date', 'time', 'scheduledAt', 'location', 'note',
]);

function isValidDate(value) {
  const match = typeof value === 'string'
    ? /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(value)
    : null;
  if (!match) return false;
  const date = new Date(Number(match[3]), Number(match[2]) - 1, Number(match[1]));
  return date.getFullYear() === Number(match[3])
    && date.getMonth() === Number(match[2]) - 1
    && date.getDate() === Number(match[1]);
}

function isFutureDateTime(dateValue, timeValue) {
  const dateMatch = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(dateValue);
  const timeMatch = /^([01]\d|2[0-3]):([0-5]\d)$/.exec(timeValue);
  if (!dateMatch || !timeMatch) return false;
  const scheduledAt = new Date(
    Number(dateMatch[3]),
    Number(dateMatch[2]) - 1,
    Number(dateMatch[1]),
    Number(timeMatch[1]),
    Number(timeMatch[2]),
  );
  return scheduledAt.getTime() > Date.now();
}

function validateAppointment(body, db) {
  if (
    !isRecord(body)
    || Object.keys(body).some((key) => !APPOINTMENT_FIELDS.has(key))
    || typeof body.itemId !== 'string'
    || typeof body.requesterId !== 'string'
    || !isText(body.date, 10, true)
    || !isValidDate(body.date)
    || !/^(?:[01]\d|2[0-3]):[0-5]\d$/.test(body.time)
    || !isFutureDateTime(body.date, body.time)
    || !isText(body.location, 200, true)
    || (body.note !== undefined && !isText(body.note, 500))
    || (body.scheduledAt !== undefined && !isText(body.scheduledAt, 40))
  ) {
    return 'Thông tin lịch hẹn không hợp lệ.';
  }
  if (!db.get('users').find({ id: body.requesterId }).value()) {
    return 'Không tìm thấy người đặt lịch.';
  }
  const item = db.get('items').find({ id: body.itemId }).value();
  if (!item) return 'Không tìm thấy món đồ.';
  if (item.ownerId === body.requesterId) return 'Bạn không thể đặt lịch món đồ của chính mình.';
  if (item.status !== 'available') return 'Món đồ không còn khả dụng.';
  return null;
}

function register({ app, router }) {
  app.get('/appointments', (request, response, next) => {
    const { requesterId, userId } = request.query;
    if (requesterId !== undefined && typeof requesterId !== 'string') {
      sendError(response, 400, 'BAD_REQUEST', 'requesterId không hợp lệ.');
      return;
    }
    if (userId !== undefined && typeof userId !== 'string') {
      sendError(response, 400, 'BAD_REQUEST', 'userId không hợp lệ.');
      return;
    }
    if (requesterId !== undefined && userId !== undefined) {
      sendError(response, 400, 'BAD_REQUEST', 'Chỉ được dùng một bộ lọc người dùng.');
      return;
    }
    if (userId) {
      response.json(router.db.get('appointments').filter((appointment) => {
        if (appointment.requesterId === userId) return true;
        const item = router.db.get('items').find({ id: appointment.itemId }).value();
        return item?.ownerId === userId;
      }).value());
      return;
    }
    if (requesterId) {
      response.json(router.db.get('appointments').filter({ requesterId }).value());
      return;
    }
    next();
  });

  app.post('/appointments', (request, response) => {
    const error = validateAppointment(request.body, router.db);
    if (error) {
      sendError(response, 400, 'BAD_REQUEST', error);
      return;
    }
    const now = new Date().toISOString();
    const appointment = {
      ...request.body,
      id: `appointment-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      status: 'pending',
      createdAt: now,
      updatedAt: now,
    };
    router.db.get('items').find({ id: appointment.itemId }).assign({
      status: 'reserved',
      updatedAt: now,
    }).write();
    router.db.get('appointments').push(appointment).write();
    response.status(201).json(appointment);
  });

  app.patch('/appointments/:id/status', (request, response) => {
    const status = request.body?.status;
    if (!APPOINTMENT_STATUSES.includes(status)) {
      sendError(response, 400, 'BAD_REQUEST', 'Trạng thái lịch hẹn không hợp lệ.');
      return;
    }
    const appointment = router.db.get('appointments').find({ id: request.params.id }).value();
    if (!appointment) {
      sendError(response, 404, 'NOT_FOUND', 'Không tìm thấy lịch hẹn.');
      return;
    }
    const allowed = {
      pending: ['confirmed', 'cancelled'],
      confirmed: ['cancelled', 'completed'],
      cancelled: [],
      completed: [],
    };
    if (!allowed[appointment.status].includes(status)) {
      sendError(response, 409, 'CONFLICT', 'Không thể chuyển trạng thái lịch hẹn.');
      return;
    }
    const now = new Date().toISOString();
    const updated = router.db.get('appointments').find({ id: appointment.id }).assign({
      status,
      updatedAt: now,
    }).write();
    if (status === 'cancelled') {
      router.db.get('items').find({ id: appointment.itemId, status: 'reserved' }).assign({
        status: 'available',
        updatedAt: now,
      }).write();
    }
    if (status === 'completed') {
      router.db.get('items').find({ id: appointment.itemId }).assign({
        status: 'exchanged',
        updatedAt: now,
      }).write();
    }
    response.json(updated);
  });
}

module.exports = { register };
