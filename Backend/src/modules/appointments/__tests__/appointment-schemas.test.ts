import { describe, expect, it } from "vitest";
import {
  createAdminAppointmentSchema,
  createPublicAppointmentSchema,
  updateAppointmentSchema,
} from "../types";

const schedule = {
  service_id: "11111111-1111-4111-8111-111111111111",
  appointment_date: "2026-07-01",
  start_time: "10:00",
  notes: null,
};

describe("appointment schemas", () => {
  it("normalizes the public phone and optional email", () => {
    const result = createPublicAppointmentSchema.parse({
      ...schedule,
      full_name: "Juan Pérez",
      phone: "+54 291 555-1234",
      email: "",
    });

    expect(result.phone).toBe("542915551234");
    expect(result.email).toBeNull();
  });

  it("accepts existing and new customers for admin creation", () => {
    const existing = createAdminAppointmentSchema.parse({
      ...schedule,
      customer_id: "22222222-2222-4222-8222-222222222222",
    });
    const fresh = createAdminAppointmentSchema.parse({
      ...schedule,
      customer_mode: "new",
      full_name: "Ana Pérez",
      phone: "2915551234",
      email: null,
    });

    expect(existing.customer_mode).toBe("existing");
    expect(fresh.customer_mode).toBe("new");
  });

  it("rejects unknown admin fields and status editing", () => {
    expect(() =>
      createAdminAppointmentSchema.parse({
        ...schedule,
        customer_id: "22222222-2222-4222-8222-222222222222",
        status: "completed",
      })
    ).toThrow();

    expect(() =>
      updateAppointmentSchema.parse({ status: "cancelled" })
    ).toThrow();
  });

  it("requires at least one editable appointment field", () => {
    expect(() => updateAppointmentSchema.parse({})).toThrow();
    expect(
      updateAppointmentSchema.parse({ notes: "Llegará puntual" })
    ).toEqual({ notes: "Llegará puntual" });
  });
});
