import { Request, Response } from "express";
import rateLimit, { Options } from "express-rate-limit";
import { loadEnv } from "../config/env";
import { error } from "../shared/utils";

const env = loadEnv();

interface RateLimiterConfig {
  windowMinutes: number;
  max: number;
  message: string;
  skipSuccessfulRequests?: boolean;
}

export function createRateLimiter(config: RateLimiterConfig) {
  return rateLimit({
    windowMs: config.windowMinutes * 60 * 1000,
    limit: config.max,
    standardHeaders: "draft-8",
    legacyHeaders: false,
    skipSuccessfulRequests: config.skipSuccessfulRequests ?? false,
    handler: (_req: Request, res: Response) => {
      res.status(429).json(error(config.message, 429));
    },
  } satisfies Partial<Options>);
}

export const loginRateLimiter = createRateLimiter({
  windowMinutes: env.RATE_LIMIT_WINDOW_MINUTES,
  max: env.LOGIN_RATE_LIMIT_MAX,
  message: "Demasiados intentos de inicio de sesión. Intentá nuevamente más tarde.",
  skipSuccessfulRequests: true,
});

export const publicBookingRateLimiter = createRateLimiter({
  windowMinutes: env.RATE_LIMIT_WINDOW_MINUTES,
  max: env.BOOKING_RATE_LIMIT_MAX,
  message: "Demasiadas solicitudes de reserva. Intentá nuevamente más tarde.",
});
