import { procedure, router } from '../trpc';
import { z } from 'zod';
import { toTRPCError } from '../../utils/errors';
import * as problemService from '../../modules/problem/service';

export const problemRouter = router({
  create: procedure
    .input(
      z.object({
        id: z.string(),
        description: z.string(),
        title: z.string(),
        constraints: z.string(),
        examples: z.string(),
        hints: z.string(),
        starterCode: z.string(),
        tests: z.string(),
        difficulty: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      const result = await problemService.createProblem(input);
      if (!result.ok) throw toTRPCError(result.error);

      return { success: true };
    }),

  getById: procedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input }) => {
      console.log('hello');
      console.log(`problem by id ${input.id}`);
      console.log(`problem by id ${input.id}`);
      console.log(`problem by id ${input.id}`);
      console.log(`problem by id ${input.id}`);
      console.log(`problem by id ${input.id}`);

      const result = await problemService.getProblemById(input);

      console.log('hello');
      if (!result.ok) throw toTRPCError(result.error);

      console.log('hello');
      return { success: true, ...result.value };
    }),

  getProblems: procedure
    .input(
      z.object({
        limit: z.number().min(1).max(100),
        cursor: z.number().min(0).default(0),
      })
    )
    .query(async ({ input }) => {
      const result = await problemService.paginate({
        limit: input.limit,
        offset: input.limit * input.cursor,
      });
      if (!result.ok) throw toTRPCError(result.error);

      return { success: true, ...result.value, cursor: input.cursor + 1 };
    }),
});
