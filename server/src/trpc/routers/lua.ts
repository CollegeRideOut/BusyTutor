import { toTRPCError } from '../../utils/errors';
import { protectedUserProcedure, router } from '../trpc';
import * as luaService from '../../modules/lua/service';
import * as problemService from '../../modules/problem/service';
import { z } from 'zod';

export const luaRouter = router({
  runLua: protectedUserProcedure
    .input(
      z.object({ problemId: z.string(), testIdx: z.number(), code: z.string() })
    )
    .mutation(async ({ input }) => {
      const problemResult = await problemService.getProblemById({
        id: input.problemId,
      });
      if (!problemResult.ok) throw toTRPCError(problemResult.error);

      const test = JSON.stringify(
        JSON.parse(problemResult.value.problem.tests)[input.testIdx]
      );

      const result = await luaService.startExecution({
        problemId: input.problemId,
        code: input.code,
        test,
      });
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
      console.log('did solution pass result', result.value.didSolutionPass);
      return {
        sucess: true,
        ...result.value,
      };
    }),
});
