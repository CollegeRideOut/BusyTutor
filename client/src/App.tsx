import { useState } from 'react';
import './App.css';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { trpc } from './lib/trpc';
import SuperJSON from 'superjson';
import { httpBatchLink } from '@trpc/client';
import { RouterProvider, createRouter } from '@tanstack/react-router';

// Import the generated route tree
import { routeTree } from './routeTree.gen';

// Create a new router instance
const router = createRouter({ routeTree });

// Register the router instance for type safety
declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

export function App() {
  const [queryClient] = useState(() => new QueryClient());
  const [trpcClient] = useState(() =>
    trpc.createClient({
      links: [
        httpBatchLink({
          url: 'http://localhost:3000',
          transformer: SuperJSON,
          headers() {
            const token = localStorage.getItem('jwt');
            return token ? { Authorization: `Bearer ${token}` } : {};
          },
        }),
      ],
    }),
  );

  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        <RouterProvider router={router} context={{ trpc: trpcClient }} />
      </QueryClientProvider>
    </trpc.Provider>
  );
}
