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
