import { z } from "zod";

function isValidTimeZone(timeZone: string): boolean {
  try {
    new Intl.DateTimeFormat("en-US", { timeZone }).format();
    return true;
  } catch {
    return false;
  }
}

function parseTrustProxy(value: unknown): false | number {
  if (value === undefined || value === "" || value === "false" || value === false) {
    return false;
  }

  const parsed = Number(value);

  if (!Number.isInteger(parsed) || parsed < 1) {
    return Number.NaN;
  }

  return parsed;
}

const envSchema = z.object({
  SUPABASE_URL: z.string().url(),
  SUPABASE_ANON_KEY: z.string().min(1),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
  DEFAULT_BARBER_PROFILE_ID: z.string().uuid(),
  APP_TIMEZONE: z
    .string()
    .refine(isValidTimeZone, "APP_TIMEZONE must be a valid IANA time zone")
    .default("America/Argentina/Buenos_Aires"),
  ALLOWED_ORIGINS: z.string().default(""),
  TRUST_PROXY: z.preprocess(
    parseTrustProxy,
    z.union([z.literal(false), z.number().int().positive()])
  ),
  RATE_LIMIT_WINDOW_MINUTES: z.coerce.number().int().positive().default(15),
  LOGIN_RATE_LIMIT_MAX: z.coerce.number().int().positive().default(5),
  BOOKING_RATE_LIMIT_MAX: z.coerce.number().int().positive().default(10),
  PORT: z.coerce.number().int().positive().default(3000),
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
});

export type Env = z.infer<typeof envSchema>;

export function loadEnv(): Env {
  const parsed = envSchema.safeParse(process.env);

  if (!parsed.success) {
    console.error("Invalid environment variables:", parsed.error.flatten().fieldErrors);
    process.exit(1);
  }

  return parsed.data;
}
