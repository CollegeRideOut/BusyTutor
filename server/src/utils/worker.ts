import path from 'path';
import { Worker } from 'node:worker_threads';

interface ManagedWorker {
  id: string;
  worker: Worker;
}

export const workers = new Map<string, ManagedWorker>();

export function createWorker(): ManagedWorker {
  const id = crypto.randomUUID();
  const worker = new Worker(
    path.resolve(__dirname, './../interperter/eval_gen.ts'), // built JS path!
    { type: 'module' } as any
  );
  worker.on('message', (msg) => {
    console.log('something happend');
    console.log(msg);

    worker.postMessage('ack');
  });
  const entry: ManagedWorker = { id, worker };
  workers.set(id, entry);
  return entry;
}
