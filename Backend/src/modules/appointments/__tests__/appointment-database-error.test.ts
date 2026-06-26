import { describe, expect, it } from "vitest";
import { mapAppointmentDatabaseError } from "../utils/appointment-database-error.utils";

describe("appointment database error mapping", () => {
  it.each([
    ["APPOINTMENT_CONFLICT", 409],
    ["APPOINTMENT_NOT_FOUND", 404],
    ["SERVICE_NOT_FOUND", 404],
    ["CUSTOMER_NOT_FOUND", 404],
    ["SERVICE_INACTIVE", 422],
    ["FINAL_APPOINTMENT_NOT_EDITABLE", 422],
    ["INVALID_STATUS_TRANSITION", 422],
    ["INVALID_INITIAL_STATUS", 422],
    ["INVALID_TIME_RANGE", 422],
    ["INVALID_CUSTOMER_NAME", 422],
    ["INVALID_CUSTOMER_PHONE", 422],
  ])("maps %s to HTTP %i", (marker, statusCode) => {
    expect(
      mapAppointmentDatabaseError({
        code: "P0001",
        message: marker,
      })
    ).toMatchObject({ statusCode });
  });

  it("preserves unexpected Error instances", () => {
    const unexpectedError = new Error("Database unavailable");

    expect(mapAppointmentDatabaseError(unexpectedError)).toBe(unexpectedError);
  });
});
