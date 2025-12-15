import { problemRepo, ProblemRecord } from '../../db/repositories/problem.repo';
import { Result } from '../../utils/someTypes';

export async function createProblem(
  input: Omit<ProblemRecord, 'createdAt'>
): Promise<Result<{ problem: ProblemRecord }>> {
  const problem = await problemRepo.create(input);
  if (!problem.ok) return problem;

  return { ok: true, value: { problem: problem.value } };
}

export async function getProblemById(input: {
  id: string;
}): Promise<Result<{ problem: ProblemRecord }>> {
  let problem = await problemRepo.findById(input.id);
  if (!problem.ok) return problem;

  return { ok: true, value: { problem: problem.value } };
}

export async function paginate(input: {
  limit: number;
  offset: number;
}): Promise<Result<{ problems: ProblemRecord[] }>> {
  let problem = await problemRepo.paginate(input);
  if (!problem.ok) return problem;

  return { ok: true, value: { problems: problem.value } };
}
