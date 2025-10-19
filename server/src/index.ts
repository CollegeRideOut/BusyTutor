import { createHTTPServer } from '@trpc/server/adapters/standalone';
import { appRouter } from './trpc/routers/index';
import { createContext } from './trpc/context';

const PORT = 3000;

// HTTP endpoint
const httpServer = createHTTPServer({
  router: appRouter,
  createContext,
  middleware: async (req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', 'http://localhost:5173');
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
    res.setHeader(
      'Access-Control-Allow-Headers',
      'Content-Type, Authorization'
    );
    if (req.method === 'OPTIONS') {
      res.writeHead(204);
      res.end();
      return;
    }
    next();
  },
});

// WebSocket endpoint for future subscriptions
//const wss = new WebSocketServer({ server: httpServer });
//applyWSSHandler({ wss, router: appRouter, createContext });

httpServer.listen(PORT);
console.log(`tRPC server running at http://localhost:${PORT}`);
