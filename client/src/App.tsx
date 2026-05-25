import { useState } from 'react';
import './App.css';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { trpc } from './lib/trpc';
import SuperJSON from 'superjson';
import { httpBatchLink } from '@trpc/client';
import { RouterProvider, createRouter } from '@tanstack/react-router';
// Import the generated route tree
import { routeTree } from './routeTree.gen';

export function trpcHelper() {
  // Vite reads the environment variable dynamically. 
  // We append '/api' to ensure it routes correctly to your backend endpoints.
  //const backendUrl = `${import.meta.env.VITE_API_URL}`;

  return trpc.createClient({
    links: [
      httpBatchLink({
        url: "/api",
        transformer: SuperJSON,

        fetch(url, options) {
          return fetch(url, {
            ...options,
            credentials: 'include',
          });
        },

        headers() {
          const token = localStorage.getItem('authToken');
          return {
            Authorization: token ? `Bearer ${token}` : '',
          };
        },
      }),
    ],
  });
}

export interface RouterContext {
  trpc: ReturnType<typeof trpcHelper>;
  token: string;
  setToken: (p: string) => void;
}

// Create a new router instance
export const router = createRouter({
  routeTree,
});

// Register the router instance for type safety
export function App() {
  const [queryClient] = useState(() => new QueryClient());
  const [trpcClient] = useState(() =>
    trpc.createClient({
      links: [
        httpBatchLink({
          url: '/api',
          transformer: SuperJSON,
          headers() {
            let token = localStorage.getItem('token');
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
