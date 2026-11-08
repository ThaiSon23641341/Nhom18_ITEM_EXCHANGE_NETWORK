// Owner: Tú. Messages are private to the participants of one appointment.
const { authenticate } = require('../lib/session.cjs');
const { isRecord, isText, sendError } = require('../lib/helpers.cjs');

const MAX_MESSAGE_LENGTH = 2000;

function findConversation(db, appointmentId) {
  const appointment = db.get('appointments').find({ id: appointmentId }).value();
  if (!appointment) return { error: 'NOT_FOUND' };
  const item = db.get('items').find({ id: appointment.itemId }).value();
  if (!item) return { error: 'NOT_FOUND' };
  const confirmedBy = Array.isArray(appointment.confirmedBy) ? appointment.confirmedBy : [];
  const isConfirmedByBoth = confirmedBy.includes(appointment.requesterId)
    && confirmedBy.includes(item.ownerId);
  return { appointment, ownerId: item.ownerId, isConfirmedByBoth };
}

function getMessages(db) {
  if (!db.has('messages').value()) db.set('messages', []).write();
  return db.get('messages');
}

function authorizeParticipant(response, userId, conversation) {
  if (userId !== conversation.ownerId && userId !== conversation.appointment.requesterId) {
    sendError(response, 403, 'FORBIDDEN', 'Bạn không tham gia lịch hẹn này.');
    return false;
  }
  return true;
}

function register({ app, router }) {
  app.get('/appointments/:id/messages', (request, response) => {
    const userId = authenticate(router.db, request);
    if (!userId) {
      sendError(response, 401, 'UNAUTHORIZED', 'Cần đăng nhập để xem tin nhắn.');
      return;
    }
    const conversation = findConversation(router.db, request.params.id);
    if (conversation.error) {
      sendError(response, 404, 'NOT_FOUND', 'Không tìm thấy lịch hẹn.');
      return;
    }
    if (!authorizeParticipant(response, userId, conversation)) return;
    if (!conversation.isConfirmedByBoth) {
      sendError(response, 409, 'CONFLICT', 'Chat chỉ mở sau khi cả hai bên xác nhận lịch hẹn.');
      return;
    }
    const messages = getMessages(router.db)
      .filter({ appointmentId: request.params.id })
      .value()
      .sort((left, right) => left.createdAt.localeCompare(right.createdAt));
    response.json(messages);
  });

  app.post('/appointments/:id/messages', (request, response) => {
    const userId = authenticate(router.db, request);
    if (!userId) {
      sendError(response, 401, 'UNAUTHORIZED', 'Cần đăng nhập để gửi tin nhắn.');
      return;
    }
    const conversation = findConversation(router.db, request.params.id);
    if (conversation.error) {
      sendError(response, 404, 'NOT_FOUND', 'Không tìm thấy lịch hẹn.');
      return;
    }
    if (!authorizeParticipant(response, userId, conversation)) return;
    if (
      !isRecord(request.body)
      || Object.keys(request.body).some((key) => key !== 'text')
      || !isText(request.body.text, MAX_MESSAGE_LENGTH, true)
    ) {
      sendError(response, 400, 'BAD_REQUEST', 'Tin nhắn không hợp lệ.');
      return;
    }
    if (!conversation.isConfirmedByBoth || conversation.appointment.status !== 'confirmed') {
      sendError(response, 409, 'CONFLICT', 'Cuộc chat đang ở chế độ chỉ đọc.');
      return;
    }
    const message = {
      id: `message-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      appointmentId: request.params.id,
      senderId: userId,
      text: request.body.text.trim(),
      createdAt: new Date().toISOString(),
    };
    getMessages(router.db).push(message).write();
    response.status(201).json(message);
  });

  app.use('/messages', (_request, response) => {
    sendError(response, 404, 'NOT_FOUND', 'Không tìm thấy tài nguyên.');
  });
}

module.exports = { MAX_MESSAGE_LENGTH, register };
