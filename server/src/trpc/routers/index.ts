import { router } from '../trpc';
import { luaRouter } from './lua';
import { userRouter } from './user';

export const appRouter = router({
  user: userRouter,
  lua: luaRouter,
});

export type AppRouter = typeof appRouter;
