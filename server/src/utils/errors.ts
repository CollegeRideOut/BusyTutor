import { TRPCError } from '@trpc/server';

export class AppError extends Error {
  constructor(
    public code: string, // machine-readable code
    message: string,
    public status: number = 500, // http status
    public meta?: Error
  ) {
    super(message);
    this.name = new.target.name; // ensures correct class name in stack
    Error.captureStackTrace?.(this, new.target); // clean stack trace
    if (meta) {
      this.meta = {
        name: meta.name,
        message: meta.message,
        stack: meta.stack,
      };
    }
  }
  toJSON() {
    return {
      code: this.code,
      message: this.message,
      status: this.status,
      ...(this.meta ? { meta: this.meta } : {}),
    };
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string) {
    super('NOT_FOUND', `${resource} not found`, 404);
  }
}

export class ValidationError extends AppError {
  constructor(details?: any) {
    super('VALIDATION_ERROR', 'Invalid input', 400, details);
  }
}
export function toTRPCError(error: AppError): TRPCError {
  let code: TRPCError['code'] = 'INTERNAL_SERVER_ERROR';
  if (error.status >= 400 && error.status < 500) {
    switch (error.code) {
      case 'VALIDATION_ERROR':
        code = 'BAD_REQUEST';
        break;
      case 'UNAUTHORIZED':
        code = 'UNAUTHORIZED';
        break;
      case 'NOT_FOUND':
        code = 'NOT_FOUND';
        break;
      default:
        code = 'BAD_REQUEST';
        break;
    }
  }

  return new TRPCError({
    code,
    message: error.message,
    cause: error, // preserves original stack for tRPC logs
  });
}
