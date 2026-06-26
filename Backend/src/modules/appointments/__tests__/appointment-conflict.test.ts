import { beforeEach, describe, expect, it, vi } from "vitest";
import { ConflictError } from "../../../shared/errors";
import { appointmentRepository } from "../repositories";
import { ValidateAppointmentConflictUseCase } from "../use-cases/validate-appointment-conflict.use-case";

describe("appointment conflict validation", () => {
  const useCase = new ValidateAppointmentConflictUseCase();

  beforeEach(() => {
    vi.spyOn(appointmentRepository, "findOverlapping");
  });

  it("accepts a free time range", async () => {
    vi.mocked(appointmentRepository.findOverlapping).mockResolvedValue([]);

    await expect(
      useCase.execute("2026-07-01", "10:00", "11:00")
    ).resolves.toBeUndefined();
  });

  it("returns the required 409 conflict error", async () => {
    vi.mocked(appointmentRepository.findOverlapping).mockResolvedValue([
      {
        id: "existing",
        customer_id: "customer",
        barber_id: null,
        service_id: "service",
        appointment_date: "2026-07-01",
        start_time: "10:30",
        end_time: "11:30",
        status: "confirmed",
        notes: null,
        created_at: "",
        updated_at: null,
      },
    ]);

    await expect(
      useCase.execute("2026-07-01", "10:00", "11:00")
    ).rejects.toMatchObject({
      statusCode: 409,
      message: "El horario seleccionado ya no está disponible.",
    });
  });

  it("passes the current appointment id when editing", async () => {
    vi.mocked(appointmentRepository.findOverlapping).mockResolvedValue([]);

    await useCase.execute("2026-07-01", "10:00", "11:00", "current-id");

    expect(appointmentRepository.findOverlapping).toHaveBeenCalledWith(
      "2026-07-01",
      "10:00",
      "11:00",
      "current-id"
    );
  });
});
