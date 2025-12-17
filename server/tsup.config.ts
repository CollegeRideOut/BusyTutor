import { defineConfig } from 'tsup';
export default defineConfig([
  // 🔹 Main server bundle
  {
    entry: ['src/index.ts'],
    format: ['cjs'], // IMPORTANT: Node + workers
    target: 'node18',
    outDir: 'dist',
    clean: true,
  },

  // 🔹 Lua worker (separate file!)
  {
    entry: ['src/worker/lua.ts'],
    format: ['cjs'], // MUST be cjs for Worker
    target: 'node18',
    outDir: 'dist/worker',
    clean: false, // don't wipe dist
  },
]);
