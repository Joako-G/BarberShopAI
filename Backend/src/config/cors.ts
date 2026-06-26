import { CorsOptions } from "cors";
import { AppError } from "../shared/errors";
import { Env } from "./env";

type CorsEnvironment = Pick<Env, "NODE_ENV" | "ALLOWED_ORIGINS">;

const localOriginPattern = /^http:\/\/(?:localhost|127\.0\.0\.1)(?::\d+)?$/;

function parseAllowedOrigins(value: string): Set<string> {
  return new Set(
    value
      .split(",")
      .map((origin) => origin.trim())
      .filter(Boolean)
  );
}

export function isOriginAllowed(
  origin: string | undefined,
  environment: CorsEnvironment
): boolean {
  if (!origin) {
    return true;
  }

  if (
    environment.NODE_ENV !== "production" &&
    localOriginPattern.test(origin)
  ) {
    return true;
  }

  return parseAllowedOrigins(environment.ALLOWED_ORIGINS).has(origin);
}

export function createCorsOptions(
  environment: CorsEnvironment
): CorsOptions {
  return {
    origin(origin, callback) {
      if (isOriginAllowed(origin, environment)) {
        callback(null, true);
        return;
      }

      callback(new AppError("Origin not allowed by CORS", 403));
    },
  };
}
