// Owner: Sơn. Endpoints: GET /health, GET /users/:id/public, POST /users.
const { isRecord, isText, sendError } = require('../lib/helpers.cjs');

const USER_FIELDS = new Set([
  'id',
  'email',
  'studentId',
  'fullName',
  'avatarUrl',
  'role',
  'createdAt',
  'updatedAt',
]);

function register({ app, router }) {
  app.get('/health', (_request, response) => {
    response.json({ status: 'ok', mode: 'json-server-demo' });
  });

  app.get('/users/:id/public', (request, response) => {
    const user = router.db.get('users').find({ id: request.params.id }).value();
    if (!user) {
      sendError(response, 404, 'NOT_FOUND', 'Không tìm thấy người dùng.');
      return;
    }
    response.json({
      id: user.id,
      fullName: user.fullName,
      avatarUrl: user.avatarUrl,
    });
  });

  app.post('/users', (request, response, next) => {
    const body = request.body;
    if (
      !isRecord(body)
      || Object.keys(body).some((key) => !USER_FIELDS.has(key))
      || typeof body.id !== 'string'
      || !/^[0-9]{8}\.[a-zA-Z]+(?:[.-][a-zA-Z]+)*@student\.iuh\.edu\.vn$/i.test(body.email)
      || !/^\d{8}$/.test(body.studentId)
      || !isText(body.fullName, 100, true)
      || body.role !== 'student'
    ) {
      sendError(response, 400, 'BAD_REQUEST', 'Thông tin tài khoản demo không hợp lệ.');
      return;
    }
    next();
  });
}

module.exports = { register };
