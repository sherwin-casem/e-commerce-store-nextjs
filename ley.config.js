const { parse } = require('pg-connection-string');

const options = {};

const connectionUrl =
  process.env.POSTGRES_URL_DIRECT || process.env.POSTGRES_URL;

if (connectionUrl) {
  const config = parse(connectionUrl);
  process.env.PGHOST = config.host;
  process.env.PGPORT = String(config.port || 5432);
  process.env.PGUSERNAME = config.user;
  process.env.PGPASSWORD = config.password;
  process.env.PGDATABASE = config.database;
  options.ssl = 'require';
} else if (process.env.NODE_ENV === 'production') {
  options.ssl = { rejectUnauthorized: false };
}

module.exports = options;
