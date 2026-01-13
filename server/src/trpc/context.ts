import * as trpcExpress from '@trpc/server/adapters/express';

export type Context = {
  userTokenInfo: {
    id: string;
  } | null;
};

export const createContext = async ({
  req,
}: trpcExpress.CreateExpressContextOptions): Promise<Context> => {
  console.log('context user request', req.user);
  return {
    userTokenInfo: req.user ? { id: ((req.user as any).user as any).id } : null,
  };
};
