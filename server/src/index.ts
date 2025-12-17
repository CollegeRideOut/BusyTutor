import { startServer } from './server/bootstrap';
import { config } from 'dotenv';
import { setupAuth } from './server/auth';

config();
setupAuth();
let server = startServer();
(globalThis as any).__server = server;
