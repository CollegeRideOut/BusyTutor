import { Result } from '../../utils/someTypes';
import { createWorker, workers } from '../../utils/worker';
import { NotFoundError } from '../../utils/errors';

export async function startExecution(input: {
  problemId: string;
  inputs: string;
  code: string;
}): Promise<Result<{ id: string; userLuaRun: string }>> {
  const userLuaRun = `${input.inputs} \n${input.code}\n return solution(nums)`;
  const entry = createWorker();
  entry.worker.postMessage({ type: 'start', code: userLuaRun });
  entry.status = 'RUNNING';
  return { ok: true, value: { id: entry.id, userLuaRun } };
}

export async function getExecutionProgress(input: {
  id: string;
  limit: number;
  cursor: number;
}): Promise<
  Result<{
    items: typeof workers.get extends any ? any[] : never;
    nextCursor: number | null;
    hasMore: boolean;
    total: number;
  }>
> {
  const entry = workers.get(input.id);
  if (!entry) return { ok: false, error: new NotFoundError('worker') };
  const start = input.cursor;
  const end = Math.min(start + input.limit, entry.timeline.length);
  const items = entry.timeline.slice(start, end);
  const hasMore = end < entry.timeline.length;
  return {
    ok: true,
    value: {
      items,
      nextCursor: hasMore ? end : null,
      hasMore,
      total: entry.timeline.length,
    },
  };
}
