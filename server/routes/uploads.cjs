// Owner: Sơn. Endpoints: POST /uploads (raw jpeg/png body), GET /uploads/:file.
const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');
const express = require('express');
const { authenticate } = require('../lib/session.cjs');
const { sendError } = require('../lib/helpers.cjs');
const { MAX_UPLOAD_BYTES, detectImageType } = require('../lib/uploads.cjs');

function register({ app, router, uploadsDir }) {
  fs.mkdirSync(uploadsDir, { recursive: true });

  // Raw binary avoids the 100 KB JSON limit and the need for a multipart parser.
  const readImage = express.raw({
    type: ['image/jpeg', 'image/png'],
    limit: MAX_UPLOAD_BYTES,
  });

  app.post('/uploads', (request, response, next) => {
    if (!authenticate(router.db, request)) {
      sendError(response, 401, 'UNAUTHORIZED', 'Vui lòng đăng nhập để tải ảnh lên.');
      return;
    }
    next();
  }, (request, response, next) => {
    readImage(request, response, (error) => {
      if (error?.type === 'entity.too.large') {
        sendError(response, 413, 'PAYLOAD_TOO_LARGE', 'Ảnh vượt quá 5 MB.');
        return;
      }
      if (error) {
        next(error);
        return;
      }
      next();
    });
  }, (request, response) => {
    const body = request.body;
    if (!Buffer.isBuffer(body) || body.length === 0) {
      sendError(response, 415, 'UNSUPPORTED_MEDIA_TYPE', 'Chỉ chấp nhận ảnh JPG hoặc PNG.');
      return;
    }
    const type = detectImageType(body);
    if (!type) {
      sendError(response, 415, 'UNSUPPORTED_MEDIA_TYPE', 'Chỉ chấp nhận ảnh JPG hoặc PNG.');
      return;
    }
    const name = `${crypto.randomBytes(16).toString('hex')}.${type.extension}`;
    fs.writeFileSync(path.join(uploadsDir, name), body);
    response.status(201).json({ url: `/uploads/${name}` });
  });

  app.use('/uploads', express.static(uploadsDir, {
    dotfiles: 'deny',
    index: false,
    setHeaders: (res) => res.setHeader('X-Content-Type-Options', 'nosniff'),
  }));
}

module.exports = { register };
