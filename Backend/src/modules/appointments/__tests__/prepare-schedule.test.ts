import { beforeEach, describe, expect, it, vi } from "vitest";
import { ValidationError } from "../../../shared/errors";
import { appointmentRepository } from "../repositories";
import { serviceRepository } from "../../services/repositories";
import { settingsRepository } from "../../settings/repositories";
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
    vi.spyOn(settingsRepository, "findBusinessHours").mockResolvedValue([
      { id: "0", day_of_week: 0, is_open: false, start_time: null, end_time: null, created_at: "", updated_at: "" },
      { id: "1", day_of_week: 1, is_open: true, start_time: "09:00", end_time: "18:00", created_at: "", updated_at: "" },
      { id: "2", day_of_week: 2, is_open: true, start_time: "09:00", end_time: "18:00", created_at: "", updated_at: "" },
      { id: "3", day_of_week: 3, is_open: true, start_time: "09:00", end_time: "18:00", created_at: "", updated_at: "" },
      { id: "4", day_of_week: 4, is_open: true, start_time: "09:00", end_time: "18:00", created_at: "", updated_at: "" },
      { id: "5", day_of_week: 5, is_open: true, start_time: "09:00", end_time: "18:00", created_at: "", updated_at: "" },
      { id: "6", day_of_week: 6, is_open: true, start_time: "09:00", end_time: "18:00", created_at: "", updated_at: "" },
    ]);
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
