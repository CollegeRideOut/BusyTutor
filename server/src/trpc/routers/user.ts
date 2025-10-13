import { userRepo } from '../../db/repositories/user.repo';
import { procedure, protectedUserProcedure, router } from '../trpc';
import { z } from 'zod';
import { toTRPCError } from '../../utils/errors';
import { signToken } from '../../utils/auth/jwt';

export const userRouter = router({
  hello: procedure
    .input(z.object({ name: z.string() }))
    .query(async ({ input }) => input.name),

  register: procedure
    .input(z.object({ email: z.string(), password: z.string() }))
    .mutation(async ({ input }) => {
      let result = await userRepo.create(input);

      if (!result.ok) throw toTRPCError(result.error);

      let user = { ...result.value, password: undefined };
      const token = signToken({ userId: user.id, email: user.email });

      return { success: true, user: user, token };
    }),

  login: procedure
    .input(z.object({ email: z.string(), password: z.string() }))
    .mutation(async ({ input }) => {
      let result = await userRepo.verifyUser(input);

      if (!result.ok) throw toTRPCError(result.error);

      const user = { ...result.value, password: undefined };
      const token = signToken({ userId: user.id, email: user.email });

      return {
        success: true,
        token,
        user,
      };
    }),

  userInfo: protectedUserProcedure.query(async ({ ctx }) => {
    let result = await userRepo.findById(ctx.userTokenInfo.id);

    if (!result.ok) throw toTRPCError(result.error);
    let user = { ...result.value, password: undefined };

    return { success: true, user };
  }),
});
