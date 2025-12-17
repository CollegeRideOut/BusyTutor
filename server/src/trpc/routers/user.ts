import { procedure, protectedUserProcedure, router } from '../trpc';
import { z } from 'zod';
import { toTRPCError } from '../../utils/errors';
import * as userService from '../../modules/user/service';

export const userRouter = router({
  //register: procedure
  //  .input(z.object({  }))
  //  .mutation(async ({ input }) => {
  //    const result = await userService.registerUser(input);
  //    if (!result.ok) throw toTRPCError(result.error);
  //
  //    return { success: true, ...result.value };
  //  }),
  //
  //login: procedure
  //  .input(z.object({ email: z.string(), password: z.string() }))
  //  .mutation(async ({ input }) => {
  //    const result = await userService.loginUser(input);
  //    if (!result.ok) throw toTRPCError(result.error);
  //
  //    return {
  //      success: true,
  //      ...result.value,
  //    };
  //  }),

  userInfo: protectedUserProcedure.query(async ({ ctx }) => {
    let result = await userService.profileUser({ id: ctx.userTokenInfo.id });

    if (!result.ok) throw toTRPCError(result.error);

    return { success: true, ...result.value };
  }),
});
