import { db } from '../client';
import { problems } from '../schema';
import { eq } from 'drizzle-orm';
import { AppError, NotFoundError, ValidationError } from '../../utils/errors';
import { Result } from '../../utils/someTypes';

export type ProblemRecord = typeof problems.$inferSelect;

export const problemRepo = {
  async create(
    data: Omit<ProblemRecord, 'createdAt'>
  ): Promise<Result<ProblemRecord>> {
    try {
      let exist = await this.findById(data.id);

      if (exist.ok) {
        return {
          ok: false,
          error: new ValidationError('Problem id already registered'),
        };
      }
      // create
      const [problem] = await db.insert(problems).values(data).returning();

      return { ok: true, value: problem };
    } catch (err) {
      console.error('[DB ERROR]', err);
      return {
        ok: false,
        error: new AppError('INTERNAL_ERROR', 'Database error', 500),
      };
    }
  },

  async findById(id: string): Promise<Result<ProblemRecord>> {
    try {
      console.log(`problem findById - ${id}`);
      let problem = await db.query.problems.findFirst({
        where: eq(problems.id, id),
      });
      if (!problem) {
        return {
          ok: false,
          error: new NotFoundError('probem with id does not exist'),
        };
      }
      return { ok: true, value: problem };
    } catch (err) {
      console.error('[DB ERROR]', err);
      return {
        ok: false,
        error: new AppError('INTERNAL_ERROR', 'Database error', 500),
      };
    }
  },

  async paginate(input: {
    limit: number;
    offset: number;
  }): Promise<Result<ProblemRecord[]>> {
    try {
      let problems = await db.query.problems.findMany({
        orderBy: (problems, { asc }) => asc(problems.id),
        limit: input.limit,
        offset: input.offset,
      });
      return { ok: true, value: problems };
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
    return db.select().from(problems);
  },
};
