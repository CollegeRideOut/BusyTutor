import { createHTTPServer } from '@trpc/server/adapters/standalone';
import { appRouter } from '../trpc/routers';
import { createContext } from '../trpc/context';
import { PORT, ALLOWED_ORIGINS } from '../config';

export function startServer() {
  const server = createHTTPServer({
    router: appRouter,
    createContext,
    middleware: (req, res, next) => {
      res.setHeader('Access-Control-Allow-Origin', ALLOWED_ORIGINS.join(','));
      res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
      if (req.method === 'OPTIONS') {
        res.writeHead(204).end();
        return;
      }
      next();
    },
  });

  server.listen(PORT);
  console.log(`tRPC server listening on http://localhost:${PORT}`);
  return server;
}
