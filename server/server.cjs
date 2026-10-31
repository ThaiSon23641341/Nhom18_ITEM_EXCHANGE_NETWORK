const fs = require('node:fs');
const path = require('node:path');
const jsonServer = require('json-server');

const ITEM_CONDITIONS = ['new', 'good', 'fair'];
const ITEM_STATUSES = ['available', 'reserved', 'exchanged'];
const REPORT_REASONS = [
  'prohibited_item',
  'misleading_information',
  'inappropriate_content',
  'suspected_scam',
  'other',
];
const REPORT_STATUSES = ['actioned', 'dismissed'];
const ITEM_FIELDS = new Set([
  'id',
  'ownerId',
  'title',
  'description',
  'category',
  'condition',
  'imageUrl',
  'imageUrls',
  'priceVnd',
  'location',
  'distance',
  'ownerName',
  'ownerFaculty',
  'ownerAvatarUrl',
]);
const ITEM_UPDATE_FIELDS = new Set([
  'title',
  'description',
  'category',
  'condition',
  'imageUrl',
  'imageUrls',
  'priceVnd',
  'location',
  'status',
]);

function normalizeText(value) {
  return value
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .replace(/[đĐ]/g, 'd')
    .toLocaleLowerCase('vi')
    .replace(/[^\p{L}\p{N}]+/gu, ' ')
    .trim();
}

function sendError(response, status, code, message) {
  response.status(status).json({ error: { code, message } });
}

function isRecord(value) {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isText(value, maxLength, required = false) {
  return typeof value === 'string'
    && (!required || value.trim().length > 0)
    && value.trim().length <= maxLength;
}

function validateCreateItem(body, db) {
  if (!isRecord(body) || Object.keys(body).some((key) => !ITEM_FIELDS.has(key))) {
    return 'Thông tin bài đăng không hợp lệ.';
  }
  if (
    typeof body.id !== 'string'
    || !isText(body.ownerId, 100, true)
    || !isText(body.title, 120, true)
    || !isText(body.description, 2000, true)
    || !isText(body.category, 80, true)
    || !ITEM_CONDITIONS.includes(body.condition)
    || !isText(body.imageUrl, 2048)
  ) {
    return 'Vui lòng kiểm tra các trường bắt buộc của bài đăng.';
  }
  if (!db.get('users').find({ id: body.ownerId }).value()) {
    return 'Không tìm thấy người đăng.';
  }
  if (
    (body.priceVnd !== undefined
      && (!Number.isSafeInteger(body.priceVnd) || body.priceVnd < 0))
    || (body.imageUrls !== undefined
      && (!Array.isArray(body.imageUrls)
        || body.imageUrls.length > 5
        || body.imageUrls.some((url) => !isText(url, 2048))))
    || (body.location !== undefined && !isText(body.location, 200))
  ) {
    return 'Giá, địa điểm hoặc danh sách ảnh không hợp lệ.';
  }
  const content = normalizeText(`${body.title} ${body.description}`);
  if (['lua dao', 'vu khi', 'ma tuy', 'hang cam'].some((term) => content.includes(term))) {
    return 'Nội dung bài đăng chứa từ khóa không được phép.';
  }
  return null;
}

function validateUpdateItem(body, db, itemId) {
  if (
    !isRecord(body)
    || Object.keys(body).length === 0
    || Object.keys(body).some((key) => !ITEM_UPDATE_FIELDS.has(key))
  ) {
    return 'Thông tin cập nhật bài đăng không hợp lệ.';
  }
  for (const [field, maxLength] of [
    ['title', 120],
    ['description', 2000],
    ['category', 80],
    ['imageUrl', 2048],
    ['location', 200],
  ]) {
    if (body[field] !== undefined && !isText(body[field], maxLength, field !== 'imageUrl')) {
      return `Trường ${field} không hợp lệ.`;
    }
  }
  if (body.condition !== undefined && !ITEM_CONDITIONS.includes(body.condition)) {
    return 'Tình trạng bài đăng không hợp lệ.';
  }
  if (
    body.status !== undefined
    && !ITEM_STATUSES.includes(body.status)
  ) {
    return 'Trạng thái bài đăng không hợp lệ.';
  }
  if (
    body.priceVnd !== undefined
    && body.priceVnd !== null
    && (!Number.isSafeInteger(body.priceVnd) || body.priceVnd < 0)
  ) {
    return 'Giá bài đăng phải là số nguyên không âm.';
  }
  if (
    body.imageUrls !== undefined
    && (!Array.isArray(body.imageUrls)
      || body.imageUrls.length > 5
      || body.imageUrls.some((url) => !isText(url, 2048)))
  ) {
    return 'Bài đăng chỉ hỗ trợ tối đa 5 đường dẫn ảnh hợp lệ.';
  }
  const content = normalizeText(`${body.title ?? ''} ${body.description ?? ''}`);
  if (['lua dao', 'vu khi', 'ma tuy', 'hang cam'].some((term) => content.includes(term))) {
    return 'Nội dung bài đăng chứa từ khóa không được phép.';
  }
  if (body.status !== undefined) {
    const item = db.get('items').find({ id: itemId }).value();
    if (!item) return 'Không tìm thấy bài đăng.';
    const transitions = {
      available: ['reserved', 'exchanged'],
      reserved: ['available', 'exchanged'],
      exchanged: [],
    };
    if (!transitions[item.status]?.includes(body.status)) {
      return 'Không thể chuyển bài đăng sang trạng thái này.';
    }
  }
  return null;
}

function createServer(dbFile = path.join(__dirname, 'db.json')) {
  if (!fs.existsSync(dbFile)) {
    throw new Error(`JSON Server database file does not exist: ${dbFile}`);
  }

  const app = jsonServer.create();
  const router = jsonServer.router(dbFile);
  app.use(jsonServer.defaults({ logger: false }));
  app.use(jsonServer.bodyParser);

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
    const allowedFields = new Set([
      'id',
      'email',
      'studentId',
      'fullName',
      'avatarUrl',
      'role',
      'createdAt',
      'updatedAt',
    ]);
    if (
      !isRecord(body)
      || Object.keys(body).some((key) => !allowedFields.has(key))
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

  app.post('/items', (request, response, next) => {
    const error = validateCreateItem(request.body, router.db);
    if (error) {
      sendError(response, 400, 'BAD_REQUEST', error);
      return;
    }
    request.body.status = 'available';
    request.body.createdAt = new Date().toISOString();
    request.body.updatedAt = request.body.createdAt;
    next();
  });

  app.patch('/items/:id', (request, response, next) => {
    const error = validateUpdateItem(request.body, router.db, request.params.id);
    if (error) {
      sendError(response, 400, 'BAD_REQUEST', error);
      return;
    }
    request.body.updatedAt = new Date().toISOString();
    next();
  });

  app.post('/reports', (request, response, next) => {
    const body = request.body;
    if (
      !isRecord(body)
      || typeof body.id !== 'string'
      || typeof body.itemId !== 'string'
      || typeof body.reporterId !== 'string'
      || !REPORT_REASONS.includes(body.reason)
      || !isText(body.details ?? '', 500)
    ) {
      sendError(response, 400, 'BAD_REQUEST', 'Thông tin báo cáo không hợp lệ.');
      return;
    }
    request.body.status = 'pending';
    request.body.createdAt = new Date().toISOString();
    request.body.updatedAt = request.body.createdAt;
    next();
  });

  app.patch('/reports/:id', (request, response, next) => {
    const body = request.body;
    if (
      !isRecord(body)
      || Object.keys(body).length !== 1
      || !REPORT_STATUSES.includes(body.status)
    ) {
      sendError(response, 400, 'BAD_REQUEST', 'Trạng thái xử lý báo cáo không hợp lệ.');
      return;
    }
    request.body.updatedAt = new Date().toISOString();
    next();
  });

  app.use(router);
  return app;
}

if (require.main === module) {
  const port = Number(process.env.PORT ?? 3001);
  const host = process.env.HOST ?? '0.0.0.0';
  createServer().listen(port, host, () => {
    console.log(`JSON Server demo listening on http://${host}:${port}`);
  });
}

module.exports = { createServer };
