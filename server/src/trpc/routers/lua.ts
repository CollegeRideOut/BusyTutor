import { createWorker, workers } from '../../utils/worker';
import { protectedUserProcedure, router } from '../trpc';
import { z } from 'zod';

const luaSolutions = {
  '217': (input: string, userCode: string) => {
    return `
        ${input}
        function our_solution(nums)
    for i = 1, #nums do
        for j = i + 1, #nums do
            if nums[i] == nums[j] then
                return true
            end
        end
    end
    return false
end
${userCode}
return our_solution(nums) == solution(nums);

        `;
  },
};

export const luaRouter = router({
  runLua: protectedUserProcedure
    .input(
      z.object({ problemId: z.string(), inputs: z.string(), code: z.string() })
    )
    .mutation(async ({ input }) => {
      let userLuaRun =
        `${input.inputs} \n` + input.code + `\n return solution(nums)`;
      let w = createWorker();
      let n_w = workers.get(w.id);
      if (!n_w) {
        throw new Error('where is the worker');
      }
      n_w.worker.postMessage(userLuaRun);

      return { sucess: true, id: w.id, userLuaRun };
    }),

  next: protectedUserProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input }) => {}),
});
