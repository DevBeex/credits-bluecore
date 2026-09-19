import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import type { DataSourceOptions } from 'typeorm';
import { resolveEnvironmentPath } from '../config/environment';
import type { Environment } from '../config/environment.validation';

export function createDatabaseOptions(env: Environment): DataSourceOptions {
  const extension = __filename.endsWith('.ts') ? 'ts' : 'js';

  return {
    type: 'postgres',
    host: env.DB_HOST,
    port: env.DB_PORT,
    username: env.DB_USERNAME,
    password: env.DB_PASSWORD,
    database: env.DB_DATABASE,
    schema: env.DB_SCHEMA,

    ssl: {
      rejectUnauthorized: true,
      ca: readFileSync(resolveEnvironmentPath(env.DB_CA_CERT_PATH), 'utf8'),
    },

    entities: [join(__dirname, '..', 'modules', '**', `*.entity.${extension}`)],
    migrations: [join(__dirname, 'migrations', `*.${extension}`)],

    migrationsTableName: 'credit_app_migrations',
    migrationsRun: false,
    synchronize: false,
    dropSchema: false,
    uuidExtension: 'pgcrypto',
    installExtensions: false,
    logging: false,
    extra: {
      max: 5,
      connectionTimeoutMillis: 10000,
    },
  };
}
