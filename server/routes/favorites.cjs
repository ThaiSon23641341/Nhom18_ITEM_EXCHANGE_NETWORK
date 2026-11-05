// Owner: Phúc. Endpoints: GET /favorites?userId=, POST /favorites, DELETE /favorites/:id.
const { randomUUID } = require('node:crypto');
const { isRecord, isText, sendError } = require('../lib/helpers.cjs');

function register({ app, router }) {
  const findUser = (userId) => router.db.get('users').find({ id: userId }).value()
    || router.db.get('users').find({ studentId: userId }).value();

  app.get('/favorites', (request, response) => {
    const userId = request.query.userId;
    if (!isText(userId, 100, true)) {
      sendError(response, 400, 'BAD_REQUEST', 'Mã người dùng là bắt buộc.');
      return;
    }

    const user = findUser(userId);
    if (!user) {
      sendError(response, 404, 'NOT_FOUND', 'User was not found.');
      return;
    }

    response.json(router.db.get('favorites').filter({ userId: user.id }).value());
  });

  app.post('/favorites', (request, response, next) => {
    const body = request.body;
    if (
      !isRecord(body)
      || Object.keys(body).some((key) => !['userId', 'itemId'].includes(key))
      || !isText(body.userId, 100, true)
      || !isText(body.itemId, 100, true)
    ) {
      sendError(response, 400, 'BAD_REQUEST', 'Thông tin yêu thích không hợp lệ.');
      return;
    }

    const user = findUser(body.userId);
    if (!user) {
      sendError(response, 404, 'NOT_FOUND', 'Không tìm thấy người dùng.');
      return;
    }
    if (!router.db.get('items').find({ id: body.itemId }).value()) {
      sendError(response, 404, 'NOT_FOUND', 'Không tìm thấy bài đăng.');
      return;
    }
    if (router.db.get('favorites').find({
      userId: user.id,
      itemId: body.itemId,
    }).value()) {
      sendError(response, 409, 'CONFLICT', 'Bài đăng đã có trong danh sách yêu thích.');
      return;
    }

    request.body = {
      id: `favorite-${randomUUID()}`,
      userId: user.id,
      itemId: body.itemId,
      createdAt: new Date().toISOString(),
    };
    next();
  });

  app.delete('/favorites/:id', (request, response, next) => {
    if (!router.db.get('favorites').find({ id: request.params.id }).value()) {
      sendError(response, 404, 'NOT_FOUND', 'Không tìm thấy mục yêu thích.');
      return;
    }
    next();
  });
}

module.exports = { register };
