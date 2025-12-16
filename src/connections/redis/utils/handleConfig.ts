import * as z from 'zod';

const RedisConfigSchema = z
  .object({
    host: z.string().min(1),
    port: z.coerce.number().int().min(1).max(65535),
    password: z.string().optional(),
    db: z.coerce.number().int().min(0).max(15).default(0),
    tls: z.boolean().default(false),
  })
  .superRefine((data, ctx) => {
    if (process.env.NODE_ENV === 'production' && !data.password) {
      ctx.addIssue({
        path: ['password'],
        message: 'Redis password is required in production',
        code: 'custom',
      });
    }
  });

export type RedisConfig = z.infer<typeof RedisConfigSchema>;

// Main function
export function getNewConfig(envVar: string) {
  const connectionString = process.env[envVar];
  if (!connectionString) {
    console.error(`${envVar} is required but was not provided`);
    process.exit(1);
  }
  const rawConfig = parseRedisUrl(connectionString);

  const config = RedisConfigSchema.safeParse(rawConfig);

  if (!config.success) {
    console.error(z.prettifyError(config.error));
    process.exit(1);
  }
  return config.data;
}

// Helper function
function parseRedisUrl(connectionString: string) {
  try {
    const parsed = new URL(connectionString);
    const dbString = parsed.pathname.slice(1);
    const dbIndex = dbString ? Number(dbString) : undefined;

    return {
      host: parsed.hostname,
      port: parsed.port,
      password: parsed.password || undefined,
      db: dbIndex,
      // Detect TLS if protocol is rediss:
      tls: parsed.protocol === 'rediss:',
    };
  } catch (_err) {
    return undefined;
  }
}
