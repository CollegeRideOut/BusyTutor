import { NotFoundError, toTRPCError } from '../../utils/errors';
import { createWorker, workers } from '../../utils/worker';
import { protectedUserProcedure, router } from '../trpc';
import { z } from 'zod';

export const luaRouter = router({
  runLua: protectedUserProcedure
    .input(
      z.object({ problemId: z.string(), inputs: z.string(), code: z.string() })
    )
    .mutation(async ({ input }) => {
      let userLuaRun =
        `${input.inputs} \n` + input.code + `\n return solution(nums)`;

      let w = createWorker();
      w.worker.postMessage({ type: 'start', code: userLuaRun });
      w.status = 'RUNNING';

      return { sucess: true, id: w.id, userLuaRun };
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
      const worker = workers.get(input.id);
      if (!worker) throw toTRPCError(new NotFoundError('worker'));
      const timeline = worker.timeline;
      const start = input.cursor;
      const end = Math.min(start + input.limit, timeline.length);
      console.log(
        'router',
        'time line length',
        timeline.length,
        'start',
        start,
        'end',
        end
      );

      // slice out the next chunk
      const items = timeline.slice(start, end);

      // if there’s more data after this chunk, return next cursor
      const hasMore = end < timeline.length;
      const nextCursor = hasMore ? end : null;

      return {
        items,
        nextCursor,
        hasMore,
        total: timeline.length, // optional, useful for client logic
      };
    }),
});
