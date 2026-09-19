import { existsSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { loadEnvFile } from 'node:process';
import {
  validateEnvironment,
  type Environment,
} from './environment.validation';

export const environmentFilePath = resolve(
  process.cwd(),
  process.env.ENV_FILE ?? '../.env',
);

export function resolveEnvironmentPath(filePath: string): string {
  return resolve(dirname(environmentFilePath), filePath);
}

export function loadEnvironment(): Environment {
  if (existsSync(environmentFilePath)) {
    loadEnvFile(environmentFilePath);
  }

  return validateEnvironment(process.env);
}
