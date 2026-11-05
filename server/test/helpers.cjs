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
  const server = await new Promise((resolve) => {
    const listening = createServer(database).listen(0, '127.0.0.1', () => resolve(listening));
  });
  return {
    baseUrl: `http://127.0.0.1:${server.address().port}`,
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

module.exports = { postJson, startTestServer };
