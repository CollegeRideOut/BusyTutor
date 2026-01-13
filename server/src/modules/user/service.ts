import { UserRecord, userRepo } from '../../db/repositories/user.repo';
import { Result } from '../../utils/someTypes';


export async function findOrRegisterUser(
  input: UserRecord
): Promise<Result<{ user: UserRecord }>> {
  let result = await userRepo.findById(input.id);

  if (result.ok) {
    return { ok: true, value: { user: result.value } };
  }

  const created = await userRepo.create(input);
  if (!created.ok) return created;
  const user = created.value;

  return { ok: true, value: { user } };
}

//export async function loginUser(input: {
//  email: string;
//  password: string;
//}): Promise<Result<{ user: SanitizedUser; token: string }>> {
//  let result = await userRepo.verifyUser(input);
//  if (!result.ok) return result;
//
//  const user = sanitize(result.value);
//  const token = signToken({ userId: user.id, email: user.email });
//
//  return { ok: true, value: { user, token } };
//}

export async function profileUser(input: {
  id: string;
}): Promise<Result<{ user: UserRecord }>> {
  let result = await userRepo.findById(input.id);
  if (!result.ok) return result;

  const user = result.value;

  return { ok: true, value: { user } };
}
