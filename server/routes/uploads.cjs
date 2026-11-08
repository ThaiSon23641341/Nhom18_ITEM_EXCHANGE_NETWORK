// Owner: Sơn. Endpoints: POST /uploads (raw or multipart jpeg/png), GET /uploads/:file.
const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');
const express = require('express');
const { authenticate } = require('../lib/session.cjs');
const { sendError } = require('../lib/helpers.cjs');
const { MAX_UPLOAD_BYTES, detectImageType } = require('../lib/uploads.cjs');

const MAX_MULTIPART_OVERHEAD = 64 * 1024;

function getMultipartImage(body, contentType) {
  const boundaryMatch = /(?:^|;)\s*boundary=(?:"([^"]+)"|([^;\s]+))/i.exec(contentType);
  const boundary = boundaryMatch?.[1] ?? boundaryMatch?.[2];
  if (!boundary || /[\r\n]/.test(boundary)) return null;

  const opening = Buffer.from(`--${boundary}\r\n`);
  if (!body.subarray(0, opening.length).equals(opening)) return null;
  const headersEnd = body.indexOf(Buffer.from('\r\n\r\n'), opening.length);
  if (headersEnd < 0) return null;

  const headers = body.subarray(opening.length, headersEnd).toString('latin1');
  if (!/^content-disposition:\s*form-data;\s*name="file"(?:;[^\r\n]*)?$/im.test(headers)) {
    return null;
  }
  if (!/content-type:\s*image\/(?:jpeg|png)\s*(?:\r\n|$)/i.test(headers)) return null;

  const imageStart = headersEnd + 4;
  const closingBoundary = Buffer.from(`\r\n--${boundary}--`);
  const imageEnd = body.indexOf(closingBoundary, imageStart);
  if (imageEnd < imageStart) return null;

  const trailingBytes = body.subarray(imageEnd + closingBoundary.length);
  if (trailingBytes.length > 0 && !trailingBytes.equals(Buffer.from('\r\n'))) return null;
  return body.subarray(imageStart, imageEnd);
}

function register({ app, router, uploadsDir }) {
  fs.mkdirSync(uploadsDir, { recursive: true });

  // Accept both the legacy raw-image request and native FormData uploads.
  const readImage = express.raw({
    type: ['image/jpeg', 'image/png', 'multipart/form-data'],
    limit: MAX_UPLOAD_BYTES + MAX_MULTIPART_OVERHEAD,
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
    const contentType = request.get('content-type') ?? '';
    const body = request.body;
    if (!Buffer.isBuffer(body) || body.length === 0) {
      sendError(response, 415, 'UNSUPPORTED_MEDIA_TYPE', 'Chỉ chấp nhận ảnh JPG hoặc PNG.');
      return;
    }
    const image = contentType.toLowerCase().startsWith('multipart/form-data')
      ? getMultipartImage(body, contentType)
      : body;
    if (!image || image.length === 0) {
      sendError(response, 415, 'UNSUPPORTED_MEDIA_TYPE', 'Chỉ chấp nhận ảnh JPG hoặc PNG.');
      return;
    }
    if (image.length > MAX_UPLOAD_BYTES) {
      sendError(response, 413, 'PAYLOAD_TOO_LARGE', 'Ảnh vượt quá 5 MB.');
      return;
    }
    const type = detectImageType(image);
    if (!type) {
      sendError(response, 415, 'UNSUPPORTED_MEDIA_TYPE', 'Chỉ chấp nhận ảnh JPG hoặc PNG.');
      return;
    }
    const name = `${crypto.randomBytes(16).toString('hex')}.${type.extension}`;
    fs.writeFileSync(path.join(uploadsDir, name), image);
    response.status(201).json({ url: `/uploads/${name}` });
  });

  app.use('/uploads', express.static(uploadsDir, {
    dotfiles: 'deny',
    index: false,
    setHeaders: (res) => res.setHeader('X-Content-Type-Options', 'nosniff'),
  }));
}

module.exports = { register };
