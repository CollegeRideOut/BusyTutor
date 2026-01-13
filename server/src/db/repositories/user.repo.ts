import { db } from '../client';
import { users } from '../schema';
import { eq } from 'drizzle-orm';
import { AppError, NotFoundError, ValidationError } from '../../utils/errors';
import { Result } from '../../utils/someTypes';

export type UserRecord = typeof users.$inferSelect;

export const userRepo = {
  async create(data: UserRecord): Promise<Result<typeof users.$inferSelect>> {
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
      const [user] = await db
        .insert(users)
        .values({ ...data, createdAt: new Date() })
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

  //async verifyUser(data: {
  //  email: string;
  //  password: string;
  //}): Promise<Result<typeof users.$inferSelect>> {
  //  try {
  //    const result = await this.findByEmail(data.email);
  //    if (!result.ok) return result;
  //    let user = result.value;
  //    if (user === undefined) {
  //      console.log('here user was undefined');
  //      return {
  //        ok: false,
  //        error: new ValidationError('Invalid credentials'),
  //      };
  //    }
  //
  //    let match = await bcrypt.compare(data.password, user.password);
  //    if (!match) {
  //      console.log(
  //        'password did not match',
  //        data.password,
  //        ' |---| ',
  //        user.password,
  //        ' el jodio email',
  //        user.email
  //      );
  //      return {
  //        ok: false,
  //        error: new NotFoundError('Invalid credentials'),
  //      };
  //    }
  //
  //    return { ok: result.ok, value: user };
  //  } catch (err) {
  //    console.error('[DB ERROR]', err);
  //    return {
  //      ok: false,
  //      error: new AppError('INTERNAL_ERROR', 'Database error', 500),
  //    };
  //  }
  //},

  async findByEmail(
    email: string
  ): Promise<Result<typeof users.$inferSelect | undefined>> {
    try {
      const user = await db.query.users.findFirst({
        where: eq(users.email, email),
      });
      console.log('bucando poer email me da', user);

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
