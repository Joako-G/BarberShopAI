import { ApiResponse, ApiErrorResponse, PaginationMeta } from "../types";

export function success<T>(data: T, statusCode = 200): ApiResponse<T> {
  return {
    success: true,
    data,
    statusCode,
  };
}

export function successPaginated<T>(
  data: T[],
  meta: PaginationMeta,
  statusCode = 200
): ApiResponse<T[]> {
  return {
    success: true,
    data,
    meta,
    statusCode,
  };
}

export function created<T>(data: T): ApiResponse<T> {
  return success(data, 201);
}

export function error(
  message: string,
  statusCode = 500,
  details?: unknown
): ApiErrorResponse {
  return {
    success: false,
    error: {
      message,
      statusCode,
      details,
    },
  };
}

export function badRequest(message: string, details?: unknown): ApiErrorResponse {
  return error(message, 400, details);
}

export function unauthorized(message = "Unauthorized"): ApiErrorResponse {
  return error(message, 401);
}

export function forbidden(message = "Forbidden"): ApiErrorResponse {
  return error(message, 403);
}

export function notFound(message = "Resource not found"): ApiErrorResponse {
  return error(message, 404);
}

export function conflict(message: string): ApiErrorResponse {
  return error(message, 409);
}

export function validationError(details: unknown): ApiErrorResponse {
  return error("Validation failed", 422, details);
}

export function internalError(message = "An unexpected error occurred"): ApiErrorResponse {
  return error(message, 500);
}