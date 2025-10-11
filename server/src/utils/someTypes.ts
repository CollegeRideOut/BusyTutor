import { AppError } from './errors';

export type Result<T> = { ok: true; value: T } | { ok: false; error: AppError };
