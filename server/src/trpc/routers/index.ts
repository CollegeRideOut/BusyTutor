import { router } from '../trpc';
import { luaRouter } from './lua';
import { problemRouter } from './problem';
import { solutionRouter } from './solution';
import { userRouter } from './user';

export const appRouter = router({
  user: userRouter,
  problem: problemRouter,
  lua: luaRouter,
  solution: solutionRouter,
});

export type AppRouter = typeof appRouter;
