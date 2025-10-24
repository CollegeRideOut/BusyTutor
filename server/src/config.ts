export const PORT = Number(process.env.PORT ?? 3000);
export const ALLOWED_ORIGINS = process.env.CORS_ORIGINS?.split(',') ?? [
  'http://localhost:5173',
];
