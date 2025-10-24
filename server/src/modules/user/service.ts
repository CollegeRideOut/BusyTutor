import { userRepo } from '../../db/repositories/user.repo';
import { users } from '../../db/schema';
import { signToken } from '../../utils/auth/jwt';
import { Result } from '../../utils/someTypes';

type UserRecord = typeof users.$inferSelect;

const sanitize = (user: UserRecord) => ({ ...user, password: undefined });
type SanitizedUser = ReturnType<typeof sanitize>;

export async function registerUser(input: {
  email: string;
  password: string;
}): Promise<Result<{ user: SanitizedUser; token: string }>> {
  const created = await userRepo.create(input);
  if (!created.ok) return created;

  const user = sanitize(created.value);
  const token = signToken({ userId: user.id, email: user.email });

  return { ok: true, value: { user, token } };
}

export async function loginUser(input: {
  email: string;
  password: string;
}): Promise<Result<{ user: SanitizedUser; token: string }>> {
  let result = await userRepo.verifyUser(input);
  if (!result.ok) return result;

  const user = sanitize(result.value);
  const token = signToken({ userId: user.id, email: user.email });

  return { ok: true, value: { user, token } };
}

export async function profileUser(input: {
  id: string;
}): Promise<Result<{ user: SanitizedUser }>> {
  let result = await userRepo.findById(input.id);
  if (!result.ok) return result;

  const user = sanitize(result.value);

  return { ok: true, value: { user } };
}
