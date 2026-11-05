// Owner: Phú. Endpoints: POST /reports, GET /reports, PATCH /reports/:id.
const { isRecord, isText, sendError } = require('../lib/helpers.cjs');

const REPORT_REASONS = [
  'prohibited_item',
  'misleading_information',
  'inappropriate_content',
  'suspected_scam',
  'other',
];
const REPORT_STATUSES = ['actioned', 'dismissed'];

function register({ app }) {
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
}

module.exports = { register };
