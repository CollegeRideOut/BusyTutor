import {  protectedUserProcedure, router } from '../trpc';
import { z } from 'zod';
import { toTRPCError } from '../../utils/errors';
import * as solutionService from '../../modules/solution/service';

export const solutionRouter = router({
  getById: protectedUserProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input }) => {
      const result = await solutionService.getById(input.id);

      if (!result.ok) throw toTRPCError(result.error);

      return { success: true, ...result.value };
    }),

  getSolutions: protectedUserProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100),
        cursor: z.number().min(0).default(0),
        problemId: z.string(),
      })
    )
    .query(async ({ input, ctx }) => {
      const result = await solutionService.paginate({
        ...input,
        userId: ctx.userTokenInfo.id,
        cursor: input.cursor,
      });
      if (!result.ok) throw toTRPCError(result.error);

      return { success: true, ...result.value };
    }),
});
