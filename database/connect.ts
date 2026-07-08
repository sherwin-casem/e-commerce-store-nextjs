import 'server-only';
import { config } from 'dotenv-safe';
import postgres from 'postgres';

const postgresTransform = {
  ...postgres.camel,
  undefined: null,
};

if (!process.env.POSTGRES_URL && process.env.NODE_ENV !== 'production') {
  config();
}

declare module globalThis {
  let postgresSqlClient: ReturnType<typeof postgres> | undefined;
}

function connectOneTimeToDatabase() {
  if (!globalThis.postgresSqlClient) {
    if (process.env.POSTGRES_URL) {
      globalThis.postgresSqlClient = postgres(process.env.POSTGRES_URL, {
        ssl: 'require',
        transform: postgresTransform,
      });
    } else {
      globalThis.postgresSqlClient = postgres({
        host:
          process.env.POSTGRES_HOST ||
          process.env.PG_HOST ||
          process.env.PGHOST,
        port: Number(process.env.POSTGRES_PORT || process.env.PGPORT || 5432),
        username: process.env.POSTGRES_USER || process.env.PGUSERNAME,
        password: process.env.POSTGRES_PASSWORD || process.env.PGPASSWORD,
        database: process.env.POSTGRES_DATABASE || process.env.PGDATABASE,
        ssl: process.env.NODE_ENV === 'production',
        transform: postgresTransform,
      });
    }
  }

  return globalThis.postgresSqlClient;
}

export const sql = connectOneTimeToDatabase();
