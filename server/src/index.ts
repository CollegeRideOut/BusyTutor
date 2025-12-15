import { startServer } from './server/bootstrap';

let server = startServer();
(globalThis as any).__server = server
