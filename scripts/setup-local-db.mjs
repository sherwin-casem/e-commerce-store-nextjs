import EmbeddedPostgres from 'embedded-postgres';
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

const dbName = 'next_js_eccomerce_store_project1';
const dbUser = 'next_js_eccomerce_store_project1';
const dbPassword = 'next_js_eccomerce_store_project1';
const port = 5433;

const envPath = path.join(process.cwd(), '.env');
const client = new EmbeddedPostgres({
  databaseDir: path.join(process.cwd(), '.pgdata'),
  user: dbUser,
  password: dbPassword,
  port,
});

async function main() {
  console.log('Starting embedded PostgreSQL...');
  await client.initialise();
  await client.start();

  try {
    await client.createDatabase(dbName);
  } catch {
    // Database may already exist from a previous run.
  }

  const envContents = `PGHOST=localhost
PGUSERNAME=${dbUser}
PGPASSWORD=${dbPassword}
PGDATABASE=${dbName}
PGPORT=${port}
POSTGRES_URL=postgresql://${dbUser}:${dbPassword}@localhost:${port}/${dbName}
`;

  fs.writeFileSync(envPath, envContents);
  console.log('Updated .env with local database credentials.');

  process.env.PGHOST = 'localhost';
  process.env.PGUSERNAME = dbUser;
  process.env.PGPASSWORD = dbPassword;
  process.env.PGDATABASE = dbName;
  process.env.PGPORT = String(port);
  process.env.POSTGRES_URL = `postgresql://${dbUser}:${dbPassword}@localhost:${port}/${dbName}`;

  console.log('Running migrations...');
  const migrate = spawnSync('npm', ['run', 'migrate'], {
    stdio: 'inherit',
    shell: true,
    env: process.env,
  });

  if (migrate.status !== 0) {
    await client.stop();
    process.exit(migrate.status ?? 1);
  }

  console.log('\nLocal database is ready.');
  console.log('For Vercel, add this environment variable:');
  console.log(`POSTGRES_URL=${process.env.POSTGRES_URL}`);
  console.log('\nNote: localhost only works locally. Create a Neon/Vercel Postgres database for production.');

  await client.stop();
}

main().catch(async (error) => {
  console.error(error);
  try {
    await client.stop();
  } catch {
    // Ignore shutdown errors.
  }
  process.exit(1);
});
