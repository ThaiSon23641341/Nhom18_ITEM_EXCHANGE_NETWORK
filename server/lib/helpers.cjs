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

module.exports = { isRecord, isText, normalizeText, sendError };
