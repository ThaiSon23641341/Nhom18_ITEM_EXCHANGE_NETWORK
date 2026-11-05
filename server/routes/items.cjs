// Owner: Phú. Endpoints: GET/POST /items, GET/PATCH/DELETE /items/:id.
// Rule to add: block editing and deleting items whose status is `exchanged`.
const { isRecord, isText, normalizeText, sendError } = require('../lib/helpers.cjs');

const ITEM_CONDITIONS = ['new', 'good', 'fair'];
const ITEM_STATUSES = ['available', 'reserved', 'exchanged'];
const PROHIBITED_TERMS = ['lua dao', 'vu khi', 'ma tuy', 'hang cam'];
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
  if (PROHIBITED_TERMS.some((term) => content.includes(term))) {
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
  if (body.status !== undefined && !ITEM_STATUSES.includes(body.status)) {
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
  if (PROHIBITED_TERMS.some((term) => content.includes(term))) {
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

function register({ app, router }) {
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
}

module.exports = { register };
