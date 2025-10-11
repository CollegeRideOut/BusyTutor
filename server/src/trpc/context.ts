import type { CreateHTTPContextOptions } from '@trpc/server/adapters/standalone';
import { verifyToken } from '../utils/auth/jwt';

export type Context = {
  userTokenInfo: {
    id: string;
    email: string;
  } | null;
};

export const createContext = async ({ req }: CreateHTTPContextOptions): Promise<Context> => {
  const authHeader = req.headers['authorization'];
  const token =
    typeof authHeader === 'string' && authHeader.startsWith('Bearer ')
      ? authHeader.slice(7)
      : null;

  const payload = token ? verifyToken(token) : null;

  return {
    userTokenInfo: payload
      ? { id: payload.userId, email: payload.email }
      : null,
  };
};
