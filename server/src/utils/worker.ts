import { Worker } from 'node:worker_threads';

import path from 'path';

interface ManagedWorker {
  id: string;
  worker: Worker;
  status: 'RUNNING' | 'FINISHED';
  timeline: {
    visual: string;
    currEnv: string;
    valueRegistry: string;
    heap: string;
  }[];
  didSolutionPass?: boolean;
}

export const workers = new Map<string, ManagedWorker>();

export function createWorker(): ManagedWorker {
  const id = crypto.randomUUID();
  const worker = new Worker(
    path.join(process.cwd(), 'dist', 'worker', 'lua.js') // built JS path!
  );

  worker.on(
    'message',
    (msg: {
      type: string;
      visual?: string;
      currEnv?: string;
      heap?: string;
      valueRegistry?: string;
      didSolutionPass?: boolean;
    }) => {
      let w = workers.get(id);
      if (!w) throw new Error('ERROR occured in the workers');

      if (msg.didSolutionPass !== undefined) {
        w.didSolutionPass = msg.didSolutionPass;
      }

      console.log('worker message  didSolutionPass', w.didSolutionPass);
      if (msg.type === 'done') {
        console.log('done');
        w.status = 'FINISHED';
      } else if (
        msg.type === 'value' &&
        msg.visual !== undefined &&
        msg.currEnv !== undefined &&
        msg.heap !== undefined
      ) {
        console.log('timeline update');
        w.timeline.push({
          visual: msg.visual,
          currEnv: msg.currEnv,
          valueRegistry: msg.valueRegistry!,
          heap: msg.heap,
        });
      } else {
        throw new Error('wtf is msg' + JSON.stringify(msg));
      }

      worker.postMessage({ type: 'ack' });
    }
  );

  const entry: ManagedWorker = { id, worker, status: 'RUNNING', timeline: [] };
  workers.set(id, entry);
  return entry;
}
