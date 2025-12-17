import { db } from '../client';
import { solutions } from '../schema';
import { AppError, NotFoundError, ValidationError } from '../../utils/errors';
import { Result } from '../../utils/someTypes';
import { eq, and } from 'drizzle-orm';

export type SolutionRecord = typeof solutions.$inferSelect;

export const solutionRepo = {
  async create(data: SolutionRecord): Promise<Result<SolutionRecord>> {
    try {
      // create
      const [solution] = await db
        .insert(solutions)
        .values({ ...data, createdAt: new Date() })
        .returning();

      return { ok: true, value: solution };
    } catch (err) {
      console.error('[DB ERROR]', err);
      return {
        ok: false,
        error: new AppError('INTERNAL_ERROR', 'Database error', 500),
      };
    }
  },

  async findById(id: string): Promise<Result<SolutionRecord>> {
    try {
      let solution = await db.query.solutions.findFirst({
        where: eq(solutions.id, id),
      });
      if (!solution) {
        return {
          ok: false,
          error: new NotFoundError('probem with id does not exist'),
        };
      }
      return { ok: true, value: solution };
    } catch (err) {
      console.error('[DB ERROR]', err);
      return {
        ok: false,
        error: new AppError('INTERNAL_ERROR', 'Database error', 500),
      };
    }
  },

  async paginate(input: {
    userId: string;
    problemId: string;
    limit: number;
    cursor: number;
  }): Promise<Result<SolutionRecord[]>> {
    try {
      let solutions = await db.query.solutions.findMany({
        where: (solutions) =>
          and(
            eq(solutions.problemId, input.problemId),
            eq(solutions.userId, input.userId)
          ),
        orderBy: (solutions, { desc }) => desc(solutions.createdAt),
        limit: input.limit,
        offset: input.cursor,
      });
      return { ok: true, value: solutions };
    } catch (err) {
      console.error('[DB ERROR]', err);
      return {
        ok: false,
        error: new AppError('INTERNAL_ERROR', 'Database error', 500),
      };
    }
  },

  // TODO
  async all() {
    return db.select().from(solutions);
  },
};
