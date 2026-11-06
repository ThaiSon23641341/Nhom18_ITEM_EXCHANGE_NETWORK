// Owner: Tú. Appointment scheduling, confirmation, and reminder lifecycle.
const { authenticate } = require('../lib/session.cjs');
const { isRecord, isText, sendError } = require('../lib/helpers.cjs');

const APPOINTMENT_STATUSES = ['confirmed', 'cancelled', 'completed'];
const APPOINTMENT_FIELDS = new Set([
  'itemId', 'requesterId', 'date', 'time', 'scheduledAt', 'location', 'note',
]);
const REMINDER_MINUTES = 60;

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

function getScheduledAt(body) {
  if (typeof body.scheduledAt === 'string') {
    const date = new Date(body.scheduledAt);
    if (Number.isFinite(date.getTime())) return date;
    return null;
  }
  const [day, month, year] = body.date.split('/').map(Number);
  const [hour, minute] = body.time.split(':').map(Number);
  return new Date(year, month - 1, day, hour, minute);
}

function isDateWithinAvailability(scheduledAt, item) {
  if (!item.availableUntil) return true;
  const availableUntil = Date.parse(item.availableUntil);
  return Number.isFinite(availableUntil) && scheduledAt.getTime() <= availableUntil;
}

function validateAppointment(body, db, authenticatedUserId) {
  if (
    !isRecord(body)
    || Object.keys(body).some((key) => !APPOINTMENT_FIELDS.has(key))
    || !isText(body.itemId, 100, true)
    || !isText(body.requesterId, 100, true)
    || body.requesterId !== authenticatedUserId
    || !isText(body.date, 10, true)
    || !isValidDate(body.date)
    || typeof body.time !== 'string'
    || !/^(?:[01]\d|2[0-3]):[0-5]\d$/.test(body.time)
    || (body.note !== undefined && !isText(body.note, 500))
    || (body.scheduledAt !== undefined && !isText(body.scheduledAt, 40, true))
  ) {
    return 'Thông tin lịch hẹn không hợp lệ.';
  }
  const scheduledAt = getScheduledAt(body);
  if (!scheduledAt || scheduledAt.getTime() <= Date.now()) {
    return 'Ngày và giờ nhận đồ phải ở trong tương lai.';
  }
  const item = db.get('items').find({ id: body.itemId }).value();
  if (!item) return 'Không tìm thấy món đồ.';
  if (item.ownerId === authenticatedUserId) return 'Bạn không thể đặt lịch món đồ của chính mình.';
  if (item.status !== 'available') return 'Món đồ không còn khả dụng.';
  if (!isDateWithinAvailability(scheduledAt, item)) {
    return 'Ngày hẹn vượt quá hạn trao của món đồ.';
  }
  return null;
}

function getParticipants(db, appointment) {
  const item = db.get('items').find({ id: appointment.itemId }).value();
  return { ownerId: item?.ownerId, requesterId: appointment.requesterId };
}

function hasConfirmedBoth(appointment, ownerId) {
  const confirmedBy = Array.isArray(appointment.confirmedBy) ? appointment.confirmedBy : [];
  return Boolean(ownerId)
    && confirmedBy.includes(ownerId)
    && confirmedBy.includes(appointment.requesterId);
}

function register({ app, router }) {
  app.get('/appointments', (request, response) => {
    const userId = authenticate(router.db, request);
    if (!userId) {
      sendError(response, 401, 'UNAUTHORIZED', 'Cần đăng nhập để xem lịch hẹn.');
      return;
    }
    if (
      (request.query.userId !== undefined && request.query.userId !== userId)
      || (request.query.requesterId !== undefined && request.query.requesterId !== userId)
    ) {
      sendError(response, 403, 'FORBIDDEN', 'Bạn không thể xem lịch hẹn của người khác.');
      return;
    }
    response.json(router.db.get('appointments').filter((appointment) => {
      if (appointment.requesterId === userId) return true;
      return getParticipants(router.db, appointment).ownerId === userId;
    }).value());
  });

  app.get('/appointments/:id', (request, response) => {
    const userId = authenticate(router.db, request);
    if (!userId) {
      sendError(response, 401, 'UNAUTHORIZED', 'Cần đăng nhập để xem lịch hẹn.');
      return;
    }
    const appointment = router.db.get('appointments').find({ id: request.params.id }).value();
    if (!appointment) {
      sendError(response, 404, 'NOT_FOUND', 'Không tìm thấy lịch hẹn.');
      return;
    }
    const { ownerId, requesterId } = getParticipants(router.db, appointment);
    if (userId !== ownerId && userId !== requesterId) {
      sendError(response, 403, 'FORBIDDEN', 'Bạn không tham gia lịch hẹn này.');
      return;
    }
    response.json(appointment);
  });

  app.post('/appointments', (request, response) => {
    const userId = authenticate(router.db, request);
    if (!userId) {
      sendError(response, 401, 'UNAUTHORIZED', 'Cần đăng nhập để đặt lịch.');
      return;
    }
    const error = validateAppointment(request.body, router.db, userId);
    if (error) {
      sendError(response, 400, 'BAD_REQUEST', error);
      return;
    }
    const now = new Date().toISOString();
    const scheduledAt = getScheduledAt(request.body);
    const item = router.db.get('items').find({ id: request.body.itemId }).value();
    const appointment = {
      itemId: request.body.itemId,
      requesterId: userId,
      date: request.body.date,
      time: request.body.time,
      scheduledAt: scheduledAt.toISOString(),
      location: item.location || 'Trong khuôn viên IUH',
      ...(request.body.note ? { note: request.body.note.trim() } : {}),
      reminderMinutes: REMINDER_MINUTES,
      reminderAt: new Date(scheduledAt.getTime() - REMINDER_MINUTES * 60 * 1000).toISOString(),
      confirmedBy: [],
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
    const userId = authenticate(router.db, request);
    if (!userId) {
      sendError(response, 401, 'UNAUTHORIZED', 'Cần đăng nhập để cập nhật lịch hẹn.');
      return;
    }
    const status = request.body?.status;
    if (
      !isRecord(request.body)
      || Object.keys(request.body).some((key) => key !== 'status')
      || !APPOINTMENT_STATUSES.includes(status)
    ) {
      sendError(response, 400, 'BAD_REQUEST', 'Trạng thái lịch hẹn không hợp lệ.');
      return;
    }
    const appointment = router.db.get('appointments').find({ id: request.params.id }).value();
    if (!appointment) {
      sendError(response, 404, 'NOT_FOUND', 'Không tìm thấy lịch hẹn.');
      return;
    }
    const { ownerId, requesterId } = getParticipants(router.db, appointment);
    if (userId !== ownerId && userId !== requesterId) {
      sendError(response, 403, 'FORBIDDEN', 'Bạn không tham gia lịch hẹn này.');
      return;
    }
    const now = new Date().toISOString();
    const confirmedBy = Array.isArray(appointment.confirmedBy)
      ? [...appointment.confirmedBy]
      : [];
    if (status === 'confirmed') {
      if (appointment.status !== 'pending' && appointment.status !== 'confirmed') {
        sendError(response, 409, 'CONFLICT', 'Lịch hẹn không còn chờ xác nhận.');
        return;
      }
      if (!confirmedBy.includes(userId)) confirmedBy.push(userId);
      const updated = router.db.get('appointments').find({ id: appointment.id }).assign({
        status: 'confirmed',
        confirmedBy,
        updatedAt: now,
      }).write();
      response.json(updated);
      return;
    }
    if (status === 'cancelled') {
      if (appointment.status !== 'pending' && appointment.status !== 'confirmed') {
        sendError(response, 409, 'CONFLICT', 'Không thể hủy lịch hẹn này.');
        return;
      }
      const updated = router.db.get('appointments').find({ id: appointment.id }).assign({
        status,
        reminderAt: null,
        updatedAt: now,
      }).write();
      router.db.get('items').find({ id: appointment.itemId, status: 'reserved' }).assign({
        status: 'available',
        updatedAt: now,
      }).write();
      response.json(updated);
      return;
    }
    if (
      status !== 'completed'
      || userId !== ownerId
      || appointment.status !== 'confirmed'
      || !hasConfirmedBoth(appointment, ownerId)
    ) {
      sendError(response, 409, 'CONFLICT', 'Chỉ chủ món mới có thể hoàn tất lịch đã được cả hai bên xác nhận.');
      return;
    }
    const updated = router.db.get('appointments').find({ id: appointment.id }).assign({
      status: 'completed',
      reminderAt: null,
      updatedAt: now,
    }).write();
    router.db.get('items').find({ id: appointment.itemId }).assign({
      status: 'exchanged',
      updatedAt: now,
    }).write();
    response.json(updated);
  });

  app.all('/appointments/:id', (_request, response) => {
    sendError(response, 405, 'METHOD_NOT_ALLOWED', 'Hãy dùng endpoint trạng thái lịch hẹn.');
  });
}

module.exports = { REMINDER_MINUTES, hasConfirmedBoth, register };
