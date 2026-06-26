import { Request, Response, NextFunction } from "express";
import { ZodError } from "zod";
import { AppError } from "../shared/errors";
import { error as errorResponse } from "../shared/utils";

export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  if (err instanceof AppError) {
    res.status(err.statusCode).json(errorResponse(err.message, err.statusCode, err.details));
    return;
  }

  if (err instanceof ZodError) {
    const details = err.errors.map((e) => ({
      path: e.path.join("."),
      message: e.message,
    }));
    res.status(422).json(errorResponse("Validation failed", 422, details));
    return;
  }

  console.error("Unhandled error:", err.message);

  const isProduction = process.env.NODE_ENV === "production";

  res.status(500).json(
    errorResponse(
      isProduction ? "An unexpected error occurred" : err.message,
      500,
      isProduction ? undefined : err.stack
    )
  );
}