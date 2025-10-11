import { drizzle } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';
import * as schema from './schema';

const sqlite = new Database('./data.db');
export const db = drizzle(sqlite, { schema });

//import { drizzle } from 'drizzle-orm/libsql'
//import { createClient } from '@libsql/client'
//const client = createClient({ url: process.env.DATABASE_URL! })
//export const db = drizzle(client)
