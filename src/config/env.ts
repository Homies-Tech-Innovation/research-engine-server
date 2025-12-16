import * as z from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),

  // Server configs
  PORT: z.coerce.number().default(3000),
  MAX_PAYLOAD_SIZE: z
    .string()
    .regex(
      /^[1-9]\d*(b|kb|mb)$/i,
      "Invalid format! Use a non-zero number followed by 'b' or 'kb' or 'mb'"
    )
    .default('10mb'),
  LOG_LEVEL: z.enum(['info', 'error', 'debug', 'warn']).default('info'),

  // Rate limiter
  RATE_LIMIT_GUEST_MAX_REQUESTS: z.coerce.number().positive().default(10),
  RATE_LIMIT_GUEST_WINDOW_SECONDS: z.coerce.number().positive().default(60),
  RATE_LIMIT_AUTH_MAX_REQUESTS: z.coerce.number().positive().default(100),
  RATE_LIMIT_AUTH_WINDOW_SECONDS: z.coerce.number().positive().default(60),
});

const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) {
  console.error(z.prettifyError(parsedEnv.error));
  process.exit(1);
}

export const env = parsedEnv.data;
