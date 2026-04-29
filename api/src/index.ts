import { buildApp } from './app';

const port = Number(process.env['PORT'] ?? 3001);
const host = process.env['HOST'] ?? '0.0.0.0';

const { app } = buildApp();

const server = app.listen(port, host, () => {
  console.log(`ShiftWell Enterprise API listening at http://${host}:${port}`);
});

function shutdown(signal: NodeJS.Signals) {
  console.log(`${signal} received; shutting down API server`);
  server.close(() => {
    process.exit(0);
  });
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
