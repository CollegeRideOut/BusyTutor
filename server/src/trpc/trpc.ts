import { initTRPC, TRPCError } from '@trpc/server';
import { Context } from './context';
import superjson from 'superjson';

const t = initTRPC.context<Context>().create({
  transformer: superjson,
  errorFormatter({ shape }) {
    return shape;
  },
});

const isAuthed = t.middleware(async ({ ctx, next }) => {
  if (!ctx.userTokenInfo) {
    throw new TRPCError({
      code: 'UNAUTHORIZED',
      message: 'You must be logged in',
    });
  }
  return next({
    ctx: {
      userTokenInfo: ctx.userTokenInfo,
    },
  });
});

export const router = t.router;
export const procedure = t.procedure;
export const protectedUserProcedure = t.procedure.use(isAuthed);
export const middleware = t.middleware;
