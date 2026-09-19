import { z } from 'zod';

const portSchema = z.coerce.number().int().min(1).max(65535);

const environmentSchema = z.object({
  PORT: portSchema.default(3000),
  DB_HOST: z.string().trim().min(1),
  DB_PORT: portSchema.default(5432),
  DB_DATABASE: z.string().trim().min(1),
  DB_SCHEMA: z.string().regex(/^[a-z_][a-z0-9_]*$/),
  DB_USERNAME: z.string().trim().min(1),
  DB_PASSWORD: z.string().min(1),
  DB_CA_CERT_PATH: z.string().trim().min(1),
});

export type Environment = z.infer<typeof environmentSchema>;

export function validateEnvironment(
  input: Record<string, unknown>,
): Environment {
  const result = environmentSchema.safeParse(input);

  if (!result.success) {
    const fields = [
      ...new Set(result.error.issues.map((issue) => issue.path.join('.'))),
    ];

    throw new Error(
      `Missing or invalid environment variables: ${fields.join(', ')}`,
    );
  }

  return result.data;
}
