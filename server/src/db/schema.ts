import { sqliteTable, integer, text } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';

export const difficulty_enum = {
  EASY: 'easy',
  MEDIUM: 'medium',
  HARD: 'hard',
} as const;

export type difficulty_enum_type =
  (typeof difficulty_enum)[keyof typeof difficulty_enum];

// users
export const users = sqliteTable('users', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  email: text('email').unique().notNull(),
  password: text('password').notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' })
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
});

// problems
export const problems = sqliteTable('problems', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  title: text('title').notNull(),
  description: text('description').notNull(),
  constraints: text('constraints').notNull(),
  examples: text('examples').notNull(),
  hints: text('hints').notNull(),
  starterCode: text('starterCode').notNull(),
  tests: text('tests').notNull(),
  difficulty: text('difficulty').notNull().default(difficulty_enum.EASY),
  createdAt: integer('created_at', { mode: 'timestamp' })
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
});

// solutions
export const solutions = sqliteTable('solutions', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  userId: text('user_id')
    .notNull()
    .references(() => users.id),
  problemId: text('problem_id')
    .notNull()
    .references(() => problems.id),
  code: text('code').notNull(),
  language: text('language').default('lua'),
  status: text('status').default('pending'),
  runtimeMs: integer('runtime_ms'),
  createdAt: integer('created_at', { mode: 'timestamp' })
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
});
