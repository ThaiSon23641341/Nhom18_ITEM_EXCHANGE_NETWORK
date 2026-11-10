// Owner: Sơn. Endpoints: GET /health, GET /users/:id/public, POST /users,
// POST /auth/login, /auth/register, /auth/forgot-password, /auth/reset-password,
// GET/DELETE /auth/session, PATCH /users/:id.
const crypto = require('node:crypto');
const {
  DEMO_PASSWORD,
  PASSWORD_PATTERN,
  STUDENT_EMAIL_PATTERN,
  hashPassword,
  verifyPassword,
} = require('../lib/credentials.cjs');
const { isRecord, isText, sendError } = require('../lib/helpers.cjs');
const { computeUserStats } = require('../lib/reputation.cjs');
const {
  authenticate,
  createSession,
  revokeToken,
  revokeUserSessions,
} = require('../lib/session.cjs');
const { UPLOAD_URL_PATTERN } = require('../lib/uploads.cjs');

const RESET_CODE_TTL_MS = 10 * 60 * 1000;
const RESET_MAX_ATTEMPTS = 5;
const INVALID_PASSWORD_MESSAGE =
  'Mật khẩu 8–64 ký tự, gồm chữ hoa, chữ thường, số và ký tự đặc biệt, không có khoảng trắng.';
const INVALID_EMAIL_MESSAGE = 'Vui lòng dùng email sinh viên IUH hợp lệ.';

const titleCaseName = (value) => value
  .split(/[.-]/)
  .filter(Boolean)
  .map((part) => `${part[0].toLocaleUpperCase('vi')}${part.slice(1).toLocaleLowerCase('vi')}`)
  .join(' ');

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

const EDITABLE_PROFILE_FIELDS = ['faculty', 'className', 'avatarUrl'];

function register({ app, router }) {
  const resetCodes = new Map();

  const findUser = (email) => router.db.get('users').find({ email }).value();
  const credentials = () => {
    if (!router.db.has('credentials').value()) router.db.set('credentials', []).write();
    return router.db.get('credentials');
  };
  const saveCredential = (userId, password) => {
    const passwordHash = hashPassword(password);
    const existing = credentials().find({ userId }).value();
    if (existing) credentials().find({ userId }).assign({ passwordHash }).write();
    else credentials().push({ userId, passwordHash }).write();
  };
  const toProfile = (user) => {
    const { reputationAdjustment: _reputationAdjustment, ...profile } = user;
    return {
      ...profile,
      faculty: user.faculty ?? '',
      className: user.className ?? '',
      isBanned: Boolean(user.isBanned),
      ...computeUserStats(router.db, user.id),
    };
  };
  const startSession = (user) => ({ ...createSession(router.db, user.id), user: toProfile(user) });
  const readEmail = (body) => (
    isRecord(body) && typeof body.email === 'string' ? body.email.trim().toLowerCase() : ''
  );

  // Password hashes live in the "credentials" collection and are never served.
  app.use('/credentials', (_request, response) => {
    sendError(response, 404, 'NOT_FOUND', 'Không tìm thấy tài nguyên.');
  });

  // Session token hashes are never served either.
  app.use('/sessions', (_request, response) => {
    sendError(response, 404, 'NOT_FOUND', 'Không tìm thấy tài nguyên.');
  });

  app.get('/health', (_request, response) => {
    response.json({ status: 'ok', mode: 'json-server-demo' });
  });

  app.post('/auth/login', (request, response) => {
    const email = readEmail(request.body);
    const password = request.body?.password;
    if (!STUDENT_EMAIL_PATTERN.test(email) || typeof password !== 'string' || !password) {
      sendError(response, 400, 'BAD_REQUEST', 'Vui lòng nhập email sinh viên và mật khẩu.');
      return;
    }
    const user = findUser(email);
    if (!user) {
      sendError(response, 404, 'ACCOUNT_NOT_FOUND', 'Tài khoản chưa tồn tại. Hãy tạo tài khoản mới.');
      return;
    }
    const credential = credentials().find({ userId: user.id }).value();
    const valid = credential
      ? verifyPassword(password, credential.passwordHash)
      : password === DEMO_PASSWORD;
    if (!valid) {
      sendError(response, 401, 'INVALID_CREDENTIALS', 'Email hoặc mật khẩu không đúng.');
      return;
    }
    if (user.isBanned) {
      sendError(response, 403, 'ACCOUNT_BANNED', 'Tài khoản đã bị khóa. Vui lòng liên hệ quản trị viên.');
      return;
    }
    const { token, user: profile } = startSession(user);
    response.json({ token, user: profile });
  });

  app.post('/auth/register', (request, response) => {
    const email = readEmail(request.body);
    const password = request.body?.password;
    const match = STUDENT_EMAIL_PATTERN.exec(email);
    if (!match || !match[1] || !match[2]) {
      sendError(response, 400, 'BAD_REQUEST', INVALID_EMAIL_MESSAGE);
      return;
    }
    if (typeof password !== 'string' || !PASSWORD_PATTERN.test(password)) {
      sendError(response, 400, 'BAD_REQUEST', INVALID_PASSWORD_MESSAGE);
      return;
    }
    const id = `student-${match[1]}`;
    if (findUser(email) || router.db.get('users').find({ id }).value()) {
      sendError(response, 409, 'ACCOUNT_EXISTS', 'Email hoặc mã sinh viên đã có tài khoản.');
      return;
    }
    const now = new Date().toISOString();
    const user = {
      id,
      email,
      studentId: match[1],
      fullName: titleCaseName(match[2]),
      avatarUrl: '',
      role: 'student',
      createdAt: now,
      updatedAt: now,
    };
    router.db.get('users').push(user).write();
    saveCredential(id, password);
    const { token, user: profile } = startSession(user);
    response.status(201).json({ token, user: profile });
  });

  // Demo only: there is no email delivery, so the code is returned to the app.
  app.post('/auth/forgot-password', (request, response) => {
    const email = readEmail(request.body);
    if (!STUDENT_EMAIL_PATTERN.test(email)) {
      sendError(response, 400, 'BAD_REQUEST', INVALID_EMAIL_MESSAGE);
      return;
    }
    if (!findUser(email)) {
      sendError(response, 404, 'ACCOUNT_NOT_FOUND', 'Tài khoản chưa tồn tại. Hãy tạo tài khoản mới.');
      return;
    }
    const resetCode = String(crypto.randomInt(0, 1000000)).padStart(6, '0');
    resetCodes.set(email, { resetCode, expiresAt: Date.now() + RESET_CODE_TTL_MS, attempts: 0 });
    response.json({ resetCode, expiresInSeconds: RESET_CODE_TTL_MS / 1000 });
  });

  app.post('/auth/reset-password', (request, response) => {
    const email = readEmail(request.body);
    const { resetCode, newPassword } = isRecord(request.body) ? request.body : {};
    if (!STUDENT_EMAIL_PATTERN.test(email) || typeof resetCode !== 'string') {
      sendError(response, 400, 'BAD_REQUEST', 'Thiếu email hoặc mã xác nhận.');
      return;
    }
    if (typeof newPassword !== 'string' || !PASSWORD_PATTERN.test(newPassword)) {
      sendError(response, 400, 'BAD_REQUEST', INVALID_PASSWORD_MESSAGE);
      return;
    }
    const pending = resetCodes.get(email);
    const user = findUser(email);
    if (!pending || !user || pending.expiresAt < Date.now() || pending.attempts >= RESET_MAX_ATTEMPTS) {
      resetCodes.delete(email);
      sendError(response, 400, 'INVALID_RESET_CODE', 'Mã xác nhận không hợp lệ hoặc đã hết hạn.');
      return;
    }
    if (pending.resetCode !== resetCode.trim()) {
      pending.attempts += 1;
      sendError(response, 400, 'INVALID_RESET_CODE', 'Mã xác nhận không hợp lệ hoặc đã hết hạn.');
      return;
    }
    resetCodes.delete(email);
    saveCredential(user.id, newPassword);
    revokeUserSessions(router.db, user.id);
    response.json({ ok: true });
  });

  app.get('/auth/session', (request, response) => {
    const userId = authenticate(router.db, request);
    const user = userId && router.db.get('users').find({ id: userId }).value();
    if (!user || user.isBanned) {
      sendError(response, 401, 'UNAUTHORIZED', 'Phiên đăng nhập đã hết hạn.');
      return;
    }
    response.json({ user: toProfile(user) });
  });

  app.delete('/auth/session', (request, response) => {
    revokeToken(router.db, request);
    response.json({ ok: true });
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
      faculty: user.faculty ?? '',
      className: user.className ?? '',
      ...computeUserStats(router.db, user.id),
    });
  });

  // Generic PUT/DELETE would bypass the profile rules below.
  app.put('/users/:id', (_request, response) => {
    sendError(response, 405, 'METHOD_NOT_ALLOWED', 'Không hỗ trợ thao tác này.');
  });
  app.delete('/users/:id', (_request, response) => {
    sendError(response, 405, 'METHOD_NOT_ALLOWED', 'Không hỗ trợ thao tác này.');
  });

  app.patch('/users/:id', (request, response) => {
    const userId = authenticate(router.db, request);
    if (!userId) {
      sendError(response, 401, 'UNAUTHORIZED', 'Vui lòng đăng nhập.');
      return;
    }
    if (userId !== request.params.id) {
      sendError(response, 403, 'FORBIDDEN', 'Bạn chỉ có thể sửa hồ sơ của chính mình.');
      return;
    }
    const body = request.body;
    const keys = isRecord(body) ? Object.keys(body) : [];
    if (keys.length === 0 || keys.some((key) => !EDITABLE_PROFILE_FIELDS.includes(key))) {
      sendError(response, 400, 'BAD_REQUEST', 'Chỉ được sửa khoa, lớp và ảnh đại diện.');
      return;
    }
    if (
      (body.faculty !== undefined && !isText(body.faculty, 100))
      || (body.className !== undefined && !isText(body.className, 50))
      || (body.avatarUrl !== undefined
        && (typeof body.avatarUrl !== 'string'
          || (body.avatarUrl !== '' && !UPLOAD_URL_PATTERN.test(body.avatarUrl))))
    ) {
      sendError(response, 400, 'BAD_REQUEST', 'Thông tin hồ sơ không hợp lệ.');
      return;
    }
    const changes = {};
    for (const key of keys) changes[key] = typeof body[key] === 'string' ? body[key].trim() : body[key];
    const users = router.db.get('users');
    if (!users.find({ id: userId }).value()) {
      sendError(response, 404, 'NOT_FOUND', 'Không tìm thấy người dùng.');
      return;
    }
    users.find({ id: userId }).assign({ ...changes, updatedAt: new Date().toISOString() }).write();
    response.json(toProfile(users.find({ id: userId }).value()));
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
