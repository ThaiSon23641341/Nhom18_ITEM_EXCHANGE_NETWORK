const fs = require('node:fs');
const path = require('node:path');

const MAX_UPLOAD_BYTES = 5 * 1024 * 1024;
const UPLOAD_URL_PATTERN = /^\/uploads\/[0-9a-f]{32}\.(?:jpg|png)$/;

// The declared Content-Type is not trusted: the file signature decides.
function detectImageType(buffer) {
  if (buffer.length >= 3 && buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
    return { mime: 'image/jpeg', extension: 'jpg' };
  }
  const pngSignature = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];
  if (buffer.length >= 8 && pngSignature.every((byte, index) => buffer[index] === byte)) {
    return { mime: 'image/png', extension: 'png' };
  }
  return null;
}

// Deletes files that no record references and that are older than the grace period.
// Callers pass every "/uploads/..." URL still in use (avatars, item photos, ...).
function removeOrphanUploads(uploadsDir, referencedUrls, graceMs = 60 * 60 * 1000) {
  if (!fs.existsSync(uploadsDir)) return [];
  const referenced = new Set(referencedUrls);
  const removed = [];
  for (const name of fs.readdirSync(uploadsDir)) {
    const url = `/uploads/${name}`;
    if (!UPLOAD_URL_PATTERN.test(url) || referenced.has(url)) continue;
    const file = path.join(uploadsDir, name);
    if (Date.now() - fs.statSync(file).mtimeMs < graceMs) continue;
    fs.rmSync(file, { force: true });
    removed.push(url);
  }
  return removed;
}

module.exports = {
  MAX_UPLOAD_BYTES,
  UPLOAD_URL_PATTERN,
  detectImageType,
  removeOrphanUploads,
};
