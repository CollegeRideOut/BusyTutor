import type { AppRouter } from '@busytutor/server/src/trpc/routers';
import { createTRPCReact } from '@trpc/react-query';

export const trpc = createTRPCReact<AppRouter>();
