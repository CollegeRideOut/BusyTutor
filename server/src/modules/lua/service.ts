import { Result } from '../../utils/someTypes';
import { createWorker, workers } from '../../utils/worker';
import { NotFoundError } from '../../utils/errors';

export async function startExecution(input: {
  problemId: string;
  test: string;
  code: string;
}): Promise<Result<{ id: string }>> {
  const entry = createWorker();
  entry.worker.postMessage({
    type: 'start',
    code: input.code,
    test: input.test,
  });
  entry.status = 'RUNNING';
  return { ok: true, value: { id: entry.id } };
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
    didSolutionPass?: boolean;
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
      didSolutionPass: entry.didSolutionPass,
      items,
      nextCursor: hasMore ? end : null,
      hasMore,
      total: entry.timeline.length,
    },
  };
}
