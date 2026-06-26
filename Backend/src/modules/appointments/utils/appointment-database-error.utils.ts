import {
  ConflictError,
  NotFoundError,
  ValidationError,
} from "../../../shared/errors";

interface DatabaseErrorLike {
  code?: unknown;
  message?: unknown;
  details?: unknown;
  hint?: unknown;
}

const getDatabaseErrorText = (error: unknown): string => {
  if (typeof error !== "object" || error === null) {
    return String(error);
  }

  const databaseError = error as DatabaseErrorLike;

  return [
    databaseError.code,
    databaseError.message,
    databaseError.details,
    databaseError.hint,
  ]
    .filter((value): value is string => typeof value === "string")
    .join(" ");
};

export const mapAppointmentDatabaseError = (error: unknown): Error => {
  const errorText = getDatabaseErrorText(error);

  if (errorText.includes("APPOINTMENT_CONFLICT")) {
    return new ConflictError("El horario seleccionado ya no está disponible.");
  }

  if (errorText.includes("APPOINTMENT_NOT_FOUND")) {
    return new NotFoundError("Appointment not found");
  }

  if (errorText.includes("SERVICE_NOT_FOUND")) {
    return new NotFoundError("Service not found");
  }

  if (errorText.includes("CUSTOMER_NOT_FOUND")) {
    return new NotFoundError("Customer not found");
  }

  if (errorText.includes("SERVICE_INACTIVE")) {
    return new ValidationError("Service is not available for booking");
  }

  if (errorText.includes("FINAL_APPOINTMENT_NOT_EDITABLE")) {
    return new ValidationError("Final-state appointments cannot be edited");
  }

  if (errorText.includes("INVALID_STATUS_TRANSITION")) {
    return new ValidationError("Invalid appointment status transition");
  }

  if (
    errorText.includes("INVALID_INITIAL_STATUS") ||
    errorText.includes("INVALID_TIME_RANGE") ||
    errorText.includes("INVALID_CUSTOMER_NAME") ||
    errorText.includes("INVALID_CUSTOMER_PHONE")
  ) {
    return new ValidationError("Invalid appointment data");
  }

  return error instanceof Error
    ? error
    : new Error("Unexpected appointment database error");
};
