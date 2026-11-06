const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { createServer } = require('../server.cjs');

const seedFile = path.join(__dirname, '..', 'db.json');

// Starts an isolated server on a temporary copy of db.json.
async function startTestServer() {
  const tempDirectory = fs.mkdtempSync(path.join(os.tmpdir(), 'nhom18-json-server-'));
  const database = path.join(tempDirectory, 'db.json');
  fs.copyFileSync(seedFile, database);
  const uploadsDir = path.join(tempDirectory, 'uploads');
  const server = await new Promise((resolve) => {
    const listening = createServer(database, { uploadsDir }).listen(0, '127.0.0.1', () => resolve(listening));
  });
  return {
    baseUrl: `http://127.0.0.1:${server.address().port}`,
    uploadsDir,
    database,
    seed: JSON.parse(fs.readFileSync(seedFile, 'utf8')),
    async close() {
      await new Promise((resolve, reject) => server.close((error) => (error ? reject(error) : resolve())));
      fs.rmSync(tempDirectory, { recursive: true, force: true });
    },
  };
}

function postJson(baseUrl, route, body, method = 'POST') {
  return fetch(`${baseUrl}${route}`, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

// Logs a seeded account in and returns its bearer header plus the user.
async function loginAs(baseUrl, email = 'sinhvien001@student.iuh.edu.vn') {
  const response = await postJson(baseUrl, '/auth/login', { email, password: 'Demo@1234' });
  const { token, user } = await response.json();
  return { token, user, headers: { Authorization: ['Bearer', token].join(' ') } };
}

module.exports = { loginAs, postJson, startTestServer };
