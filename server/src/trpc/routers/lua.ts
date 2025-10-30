import { NotFoundError, toTRPCError } from '../../utils/errors';
import { createWorker, workers } from '../../utils/worker';
import { protectedUserProcedure, router } from '../trpc';
import * as luaService from '../../modules/lua/service';
import { z } from 'zod';

export const luaRouter = router({
  runLua: protectedUserProcedure
    .input(
      z.object({ problemId: z.string(), inputs: z.string(), code: z.string() })
    )
    .mutation(async ({ input }) => {
      const result = await luaService.startExecution(input);
      if (!result.ok) throw result.error;

      return { sucess: true, ...result.value };
    }),

  progress: protectedUserProcedure
    .input(
      z.object({
        id: z.string(),
        limit: z.number().min(1).max(100),
        cursor: z.number().min(0).default(0),
      })
    )
    .query(async ({ input }) => {
      let result = await luaService.getExecutionProgress(input);
      if (!result.ok) throw toTRPCError(result.error);
      return {
        sucess: true,
        ...result.value,
      };
    }),
});
