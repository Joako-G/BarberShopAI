import { beforeEach, describe, expect, it, vi } from "vitest";
import { appointmentRepository } from "../repositories";
import { TransitionAppointmentStatusUseCase } from "../use-cases/transition-appointment-status.use-case";

describe("appointment status transitions", () => {
  const appointment = {
    id: "33333333-3333-4333-8333-333333333333",
    customer_id: "22222222-2222-4222-8222-222222222222",
    barber_id: null,
    service_id: "11111111-1111-4111-8111-111111111111",
    appointment_date: "2030-07-01",
    start_time: "10:00",
    end_time: "11:00",
    status: "confirmed" as const,
    notes: null,
    created_at: "",
    updated_at: null,
    customer: {
      id: "22222222-2222-4222-8222-222222222222",
      full_name: "Juan",
      phone: "2915551234",
      email: null,
    },
    service: {
      id: "11111111-1111-4111-8111-111111111111",
      name: "Corte",
      description: null,
      duration_minutes: 45,
      buffer_minutes: 15,
      price: 15000,
      is_active: true,
    },
  };

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it.each([
    "confirmed",
    "cancelled",
    "completed",
    "no_show",
  ] as const)("delegates transition to %s atomically", async (nextStatus) => {
    const updateStatusAtomic = vi
      .spyOn(appointmentRepository, "updateStatusAtomic")
      .mockResolvedValue({ ...appointment, status: nextStatus });

    await new TransitionAppointmentStatusUseCase().execute(
      appointment.id,
      nextStatus
    );

    expect(updateStatusAtomic).toHaveBeenCalledWith(
      appointment.id,
      nextStatus
    );
  });

  it("maps a concurrent invalid transition to 422", async () => {
    vi.spyOn(appointmentRepository, "updateStatusAtomic").mockRejectedValue({
      code: "P0001",
      message: "INVALID_STATUS_TRANSITION",
      details: "Cannot change appointment status from completed to cancelled",
    });

    await expect(
      new TransitionAppointmentStatusUseCase().execute(
        appointment.id,
        "cancelled"
      )
    ).rejects.toMatchObject({
      statusCode: 422,
      message: "Invalid appointment status transition",
    });
  });

  it("maps a missing appointment to 404", async () => {
    vi.spyOn(appointmentRepository, "updateStatusAtomic").mockRejectedValue({
      code: "P0001",
      message: "APPOINTMENT_NOT_FOUND",
    });

    await expect(
      new TransitionAppointmentStatusUseCase().execute(
        appointment.id,
        "confirmed"
      )
    ).rejects.toMatchObject({ statusCode: 404 });
  });
});
