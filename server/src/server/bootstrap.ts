import express from 'express';
import cors from 'cors';
import { createExpressMiddleware } from '@trpc/server/adapters/express';
import { appRouter } from '../trpc/routers';
import { createContext } from '../trpc/context';
import { PORT, ALLOWED_ORIGINS } from '../config';

export function startServer() {
  const app = express();
  app.use(
    cors({
      origin: ALLOWED_ORIGINS,
      credentials: true,
    })
  );
  app.get('/api/health', (_req, res) => res.send('OK'));
  app.use(
    '/api',
    createExpressMiddleware({
      router: appRouter,
      createContext,
    })
  );
  let listen = app.listen(PORT, '0.0.0.0', () => {
    console.log(`tRPC server running on http://0.0.0.0:${PORT}/api`);
  });

  return listen;
}
