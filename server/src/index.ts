import { startServer } from './server/bootstrap';
import { config } from 'dotenv';
import { setupAuth } from './server/auth';

config();
setupAuth();
console.log('starting server again')
let server = startServer();

(globalThis as any).__server = server;
