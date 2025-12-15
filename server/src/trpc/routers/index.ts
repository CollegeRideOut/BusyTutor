import { router } from '../trpc';
import { luaRouter } from './lua';
import { problemRouter } from './problem';
import { userRouter } from './user';

export const appRouter = router({
  user: userRouter,
  problem: problemRouter,
  lua: luaRouter,
});

export type AppRouter = typeof appRouter;
