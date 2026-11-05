const fs = require('node:fs');
const path = require('node:path');
const jsonServer = require('json-server');

// Each file in ./routes belongs to one team member; see root/PHASE4_ASSIGNMENT.md.
const routeModules = [
  require('./routes/users.cjs'),
  require('./routes/items.cjs'),
  require('./routes/reports.cjs'),
  require('./routes/appointments.cjs'),
  require('./routes/favorites.cjs'),
];

function createServer(dbFile = path.join(__dirname, 'db.json')) {
  if (!fs.existsSync(dbFile)) {
    throw new Error(`JSON Server database file does not exist: ${dbFile}`);
  }

  const app = jsonServer.create();
  const router = jsonServer.router(dbFile);
  app.use(jsonServer.defaults({ logger: false }));
  app.use(jsonServer.bodyParser);

  for (const routeModule of routeModules) {
    routeModule.register({ app, router });
  }

  app.use(router);
  return app;
}

if (require.main === module) {
  const port = Number(process.env.PORT ?? 3001);
  const host = process.env.HOST ?? '0.0.0.0';
  createServer().listen(port, host, () => {
    console.log(`JSON Server demo listening on http://${host}:${port}`);
  });
}

module.exports = { createServer };
