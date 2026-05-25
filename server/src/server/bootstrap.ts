import express from 'express';
import cors from 'cors';
import { createExpressMiddleware } from '@trpc/server/adapters/express';
import { appRouter } from '../trpc/routers';
import { createContext } from '../trpc/context';
import { PORT, ALLOWED_ORIGINS } from '../config';
import passport from 'passport';
import session from 'express-session';

export function startServer() {
  const FRONTEND_URL = process.env.FRONTEND_URL ?? 'http://localhost:5173';
  const isProduction = process.env.NODE_ENV === 'production';

  if (process.env.SESSION_SECRET === undefined)
    throw new Error('no session secret');

  const app = express();
  app.set('trust proxy', 1);

  app.use(
    session({
      secret: process.env.SESSION_SECRET,
      resave: false,
      saveUninitialized: false, // Changed to false (good practice for login sessions)

      cookie: {
        httpOnly: true,
        secure: isProduction, // Evaluates to true on Railway production
        sameSite: isProduction ? 'none' : 'lax', // Must be 'none' for cross-domain cookies
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
