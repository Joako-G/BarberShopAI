import { beforeEach, describe, expect, it, vi } from "vitest";
import { ValidationError } from "../../../shared/errors";
import { appointmentRepository } from "../repositories";
import { serviceRepository } from "../../services/repositories";
import { PrepareAppointmentScheduleUseCase } from "../use-cases/prepare-appointment-schedule.use-case";

const service = {
  id: "11111111-1111-4111-8111-111111111111",
  name: "Corte",
  description: null,
  duration_minutes: 45,
  buffer_minutes: 15,
  price: 15000,
  is_active: true,
  created_at: "",
};

describe("schedule preparation", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-06-25T12:00:00.000Z"));
    vi.spyOn(serviceRepository, "findById").mockResolvedValue(service);
    vi.spyOn(appointmentRepository, "findOverlapping").mockResolvedValue([]);
  });

  it("calculates end_time and validates availability", async () => {
    await expect(
      new PrepareAppointmentScheduleUseCase().execute({
        serviceId: service.id,
        appointmentDate: "2026-06-26",
        startTime: "10:00",
      })
    ).resolves.toEqual({ endTime: "11:00" });
  });

  it("rejects past appointments", async () => {
    await expect(
      new PrepareAppointmentScheduleUseCase().execute({
        serviceId: service.id,
        appointmentDate: "2026-06-24",
        startTime: "10:00",
      })
    ).rejects.toBeInstanceOf(ValidationError);
  });

  it("rejects inactive services", async () => {
    vi.mocked(serviceRepository.findById).mockResolvedValue({
      ...service,
      is_active: false,
    });

    await expect(
      new PrepareAppointmentScheduleUseCase().execute({
        serviceId: service.id,
        appointmentDate: "2026-06-26",
        startTime: "10:00",
      })
    ).rejects.toMatchObject({
      statusCode: 422,
      message: "Service is not available for booking",
    });
  });

  it("rejects Sundays and appointments ending after closing time", async () => {
    await expect(
      new PrepareAppointmentScheduleUseCase().execute({
        serviceId: service.id,
        appointmentDate: "2026-06-28",
        startTime: "10:00",
      })
    ).rejects.toBeInstanceOf(ValidationError);

    await expect(
      new PrepareAppointmentScheduleUseCase().execute({
        serviceId: service.id,
        appointmentDate: "2026-06-26",
        startTime: "17:30",
      })
    ).rejects.toBeInstanceOf(ValidationError);
  });
});
