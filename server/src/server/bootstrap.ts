import express from 'express';
import cors from 'cors';
import { createExpressMiddleware } from '@trpc/server/adapters/express';
import { appRouter } from '../trpc/routers';
import { createContext } from '../trpc/context';
import { PORT, ALLOWED_ORIGINS } from '../config';
import passport from 'passport';
import session from 'express-session';

const FRONTEND_URL = process.env.FRONTEND_URL ?? 'http://localhost:5173';

export function startServer() {
  if (process.env.SESSION_SECRET === undefined)
    throw new Error('no session secret');

  const app = express();

  app.use(
    session({
      secret: process.env.SESSION_SECRET,
      resave: false,
      saveUninitialized: true,

      cookie: {
        httpOnly: true,
        secure: process.env.HTTPS ? true : false, // 🔴 REQUIRED (HTTPS only)
        sameSite: process.env.HTTPS ? 'none' : 'lax',
        maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
      },
    })
  );

  app.use(
    cors({
      origin: ALLOWED_ORIGINS,
      credentials: true,
    })
  );

  app.use(passport.initialize());
  app.use(passport.session());
  //app.options('/api/*', cors());

  // lets set up the auth here
  app.get('/api/health', (_req, res) => res.send('OK'));
  app.get(
    '/api/auth/google',
    passport.authenticate('google', { scope: ['email', 'profile'] })
  );

  app.get(
    '/api/google/callback',
    passport.authenticate('google', {
      successRedirect: `${FRONTEND_URL}/practice`,
      failureRedirect: `${FRONTEND_URL}/`,
    })
  );
  app.get('/api/me', (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ user: null });
    }

    res.json({ user: req.user });
  });

  app.post('/api/logout', (req, res) => {
    req.logout(() => {
      req.session.destroy(() => {
        res.clearCookie('busytutor.sid');
        res.sendStatus(204);
      });
    });
  });

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
