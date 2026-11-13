const { isRecord, sendError } = require('../lib/helpers.cjs');
const { computeUserStats } = require('../lib/reputation.cjs');
const { authenticate, revokeUserSessions } = require('../lib/session.cjs');

function register({ app, router }) {
  const requireModerator = (request, response) => {
    const userId = authenticate(router.db, request);
    if (!userId) {
      sendError(response, 401, 'UNAUTHORIZED', 'Vui lòng đăng nhập bằng tài khoản quản trị.');
      return null;
    }
    const user = router.db.get('users').find({ id: userId }).value();
    if (!user || user.role !== 'moderator' || user.isBanned) {
      sendError(response, 403, 'FORBIDDEN', 'Chỉ tài khoản moderator mới được quản trị hệ thống.');
      return null;
    }
    return user;
  };

  const toAdminProfile = (user) => {
    const { reputationAdjustment: _reputationAdjustment, ...profile } = user;
    return {
      ...profile,
      faculty: user.faculty ?? '',
      className: user.className ?? '',
      isBanned: Boolean(user.isBanned),
      ...computeUserStats(router.db, user.id),
    };
  };

  app.get('/admin/users', (request, response) => {
    if (!requireModerator(request, response)) return;
    const users = router.db.get('users').value().map(toAdminProfile);
    response.json(users);
  });

  app.get('/admin/metrics', (request, response) => {
    if (!requireModerator(request, response)) return;
    response.json({
      students: router.db.get('users').filter({ role: 'student' }).size().value(),
      availableItems: router.db.get('items').filter({ status: 'available' }).size().value(),
      pendingReports: router.db.get('reports').filter({ status: 'pending' }).size().value(),
      completedExchanges: router.db.get('appointments').filter({ status: 'completed' }).size().value(),
    });
  });

  app.patch('/admin/users/:id', (request, response) => {
    if (!requireModerator(request, response)) return;
    const body = request.body;
    const keys = isRecord(body) ? Object.keys(body) : [];
    const validBanUpdate = keys.length === 1 && typeof body.isBanned === 'boolean';
    const validReputationUpdate = keys.length === 1
      && Number.isInteger(body.reputationDelta)
      && Math.abs(body.reputationDelta) === 10;
    if (!validBanUpdate && !validReputationUpdate) {
      sendError(response, 400, 'BAD_REQUEST', 'Chỉ hỗ trợ khóa/mở khóa hoặc điều chỉnh uy tín 10 điểm.');
      return;
    }

    const target = router.db.get('users').find({ id: request.params.id }).value();
    if (!target) {
      sendError(response, 404, 'NOT_FOUND', 'Không tìm thấy người dùng.');
      return;
    }
    if (target.role !== 'student') {
      sendError(response, 403, 'FORBIDDEN', 'Không thể thay đổi tài khoản moderator.');
      return;
    }

    const changes = validBanUpdate
      ? { isBanned: body.isBanned }
      : {
          reputationAdjustment: Math.max(
            -100,
            Math.min(100, (target.reputationAdjustment ?? 0) + body.reputationDelta),
          ),
        };
    const updated = {
      ...target,
      ...changes,
      updatedAt: new Date().toISOString(),
    };
    router.db.get('users').find({ id: target.id }).assign(updated).write();
    if (validBanUpdate && body.isBanned) revokeUserSessions(router.db, target.id);
    response.json(toAdminProfile(updated));
  });
}

module.exports = { register };
