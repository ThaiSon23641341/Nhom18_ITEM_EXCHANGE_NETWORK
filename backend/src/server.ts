import { app } from './app.js';

const parsedPort = Number(process.env.PORT ?? 4000);
if (!Number.isInteger(parsedPort) || parsedPort < 1 || parsedPort > 65535) {
  throw new Error('PORT must be an integer between 1 and 65535.');
}

app.listen(parsedPort, '0.0.0.0', () => {
  console.log(`Demo API listening on port ${parsedPort}/api/v1`);
  console.log('Data is in memory only; no database connection is configured.');
});
