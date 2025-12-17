import {
  solutionRepo,
  SolutionRecord,
} from '../../db/repositories/solution.repo';
import { Result } from '../../utils/someTypes';

export async function create(
  input: SolutionRecord
): Promise<Result<{ solution: SolutionRecord }>> {
  console.log('calling service create', input.userId);

  let result = await solutionRepo.create(input);

  if (!result.ok) return result;
  const solution = result.value;

  return { ok: true, value: { solution } };
}

export async function getById(
  id: string
): Promise<Result<{ solution: SolutionRecord }>> {
  let result = await solutionRepo.findById(id);

  if (!result.ok) return result;
  const solution = result.value;

  return { ok: true, value: { solution } };
}

export async function paginate(input: {
  userId: string;
  problemId: string;
  limit: number;
  cursor: number;
}): Promise<
  Result<{
    solutions: SolutionRecord[];
    nextCursor: number | null;
    hasMore: boolean;
  }>
> {
  let result = await solutionRepo.paginate({
    ...input,
    limit: input.limit + 1,
  });
  if (!result.ok) return result;

  const solutions = result.value;
  let hasMore = true;
  if (solutions.length <= input.limit) {
    hasMore = false;
  } else {
    solutions.pop();
  }

  return {
    ok: true,
    value: {
      nextCursor: hasMore ? input.cursor + input.limit : null,
      solutions,
      hasMore,
    },
  };
}
