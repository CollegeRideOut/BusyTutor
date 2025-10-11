import { db } from '../client';
import bcrypt from 'bcrypt';
import { users } from '../schema';
import { eq } from 'drizzle-orm';
import { AppError, NotFoundError, ValidationError } from '../../utils/errors';
import { Result } from '../../utils/someTypes';
const SALT_ROUNDS = 10;

export const userRepo = {
  async create(data: {
    email: string;
    password: string;
  }): Promise<Result<typeof users.$inferSelect>> {
    try {
      let exist = await this.existByEmail(data.email);
      if (!exist.ok) return exist;
      if (exist.value) {
        return {
          ok: false,
          error: new ValidationError('Email already registered'),
        };
      }
      // create
      const hashed = await bcrypt.hash(data.password, SALT_ROUNDS);
      const [user] = await db
        .insert(users)
        .values({ ...data, password: hashed })
        .returning();

      return { ok: true, value: user };
    } catch (err) {
      console.error('[DB ERROR]', err);
      return {
        ok: false,
        error: new AppError('INTERNAL_ERROR', 'Database error', 500),
      };
    }
  },

  async findById(id: string): Promise<Result<typeof users.$inferSelect>> {
    try {
      let user = await db.query.users.findFirst({ where: eq(users.id, id) });
      if (!user) {
        return {
          ok: false,
          error: new NotFoundError('user with id does not exist'),
        };
      }
      return { ok: true, value: user };
    } catch (err) {
      console.error('[DB ERROR]', err);
      return {
        ok: false,
        error: new AppError('INTERNAL_ERROR', 'Database error', 500),
      };
    }
  },

  async existByEmail(email: string): Promise<Result<boolean>> {
    const result = await this.findByEmail(email);
    if (!result.ok) return result; // propagate DB failure
    return { ok: true, value: !!result.value };
  },

  async verifyUser(data: {
    email: string;
    password: string;
  }): Promise<Result<any>> {
    try {
      const result = await this.findByEmail(data.email);
      if (!result.ok) return result;
      if (result.value === undefined) {
        return {
          ok: false,
          error: new ValidationError('Invalid credentials'),
        };
      }

      let match = await bcrypt.compare(data.password, result.value.password);
      if (!match) {
        return {
          ok: false,
          error: new NotFoundError('Invalid credentials'),
        };
      }

      return result;
    } catch (err) {
      console.error('[DB ERROR]', err);
      return {
        ok: false,
        error: new AppError('INTERNAL_ERROR', 'Database error', 500),
      };
    }
  },

  async findByEmail(
    email: string
  ): Promise<Result<typeof users.$inferSelect | undefined>> {
    try {
      const user = await db.query.users.findFirst({
        where: eq(users.email, email),
      });
      return { ok: true, value: user };
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
    return db.select().from(users);
  },
};
