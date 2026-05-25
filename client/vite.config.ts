import path from 'path';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { tanstackRouter } from '@tanstack/router-plugin/vite';

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // 🟢 Load env file based on the current mode (development/production)
  // The third parameter '' ensures Vite loads all variables instead of just VITE_ prefixes inside the config
  const env = loadEnv(mode, process.cwd(), '');

  // 🟢 Fallback to localhost if the variable isn't defined yet
  const backendTarget = env.VITE_APP_URL || 'http://localhost:3000';

  return {
    plugins: [
      tanstackRouter({
        target: 'react',
        autoCodeSplitting: true,
      }),
      tailwindcss(),
      react(),
    ],
    server: {
      proxy: {
        '/api': {
          target: backendTarget, // 🟢 Now using your environment variable dynamically
          changeOrigin: true,
          secure: false,
        },
      },
    },
    preview: {
      allowedHosts: ['.railway.app', '.collegerideout.dev'],
      // Optional: Add a proxy here too if you test preview locally with a different target
      proxy: {
        '/api': {
          target: backendTarget,
          changeOrigin: true,
          secure: false,
        },
      },
    },
    resolve: {
      dedupe: ['react', 'react-dom'],
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
  };
});
