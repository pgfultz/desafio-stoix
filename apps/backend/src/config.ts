import dotenv from 'dotenv';

dotenv.config();

function requireEnv(name: string, def?: string): string {
  const v = process.env[name] ?? def;
  if (!v) throw new Error(`Missing env ${name}`);
  return v;
}

export const config = {
  port: Number(requireEnv('PORT', '4000')),
  db: {
    host: requireEnv('POSTGRES_HOST', 'localhost'),
    port: Number(requireEnv('POSTGRES_PORT', '5432')),
    database: requireEnv('POSTGRES_DB', 'tasks'),
    user: requireEnv('POSTGRES_USER', 'postgres'),
    password: requireEnv('POSTGRES_PASSWORD', 'postgres'),
  },
  corsOrigin: requireEnv('FRONTEND_ORIGIN', 'http://localhost:5173'),
};
