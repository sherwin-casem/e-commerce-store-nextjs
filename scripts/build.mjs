import { spawnSync } from 'node:child_process';
import { config } from 'dotenv';

config();

// Prefer direct connection for migrations (Neon pooler can fail on DDL).
if (process.env.POSTGRES_URL_DIRECT) {
  process.env.POSTGRES_URL = process.env.POSTGRES_URL_DIRECT;
}

function run(command, args) {
  const result = spawnSync(command, args, {
    stdio: 'inherit',
    shell: true,
    env: process.env,
  });

  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}

if (process.env.POSTGRES_URL || process.env.PGHOST) {
  console.log('Running database migrations...');
  run('npm', ['run', 'migrate']);
} else {
  console.warn('Skipping migrations: no database env vars configured.');
}

run('npm', ['run', 'build:next']);
