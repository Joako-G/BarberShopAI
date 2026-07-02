import { beforeEach, describe, expect, it, vi } from "vitest";
import { ValidationError } from "../../../shared/errors";
import { appointmentRepository } from "../repositories";
import { serviceRepository } from "../../services/repositories";
import { settingsRepository } from "../../settings/repositories";
import { UpdateAppointmentUseCase } from "../use-cases/update-appointment.use-case";

const appointment = {
  id: "33333333-3333-4333-8333-333333333333",
  customer_id: "22222222-2222-4222-8222-222222222222",
  guest_full_name: null,
  guest_phone: null,
  guest_email: null,
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
    created_at: "",
  },
};

describe("appointment editing", () => {
  beforeEach(() => {
    vi.spyOn(appointmentRepository, "findById").mockResolvedValue(appointment);
    vi.spyOn(appointmentRepository, "updateDetailsAtomic").mockResolvedValue(
      appointment
    );
    vi.spyOn(appointmentRepository, "findOverlapping").mockResolvedValue([]);
    vi.spyOn(serviceRepository, "findById").mockResolvedValue(
      appointment.service
    );
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

  it.each(["completed", "cancelled", "no_show"] as const)(
    "blocks editing %s appointments",
    async (status) => {
      vi.mocked(appointmentRepository.findById).mockResolvedValue({
        ...appointment,
        status,
      });

      await expect(
        new UpdateAppointmentUseCase().execute(appointment.id, {
          notes: "Nueva nota",
        })
      ).rejects.toBeInstanceOf(ValidationError);
    }
  );

  it("revalidates schedule changes while excluding the current id", async () => {
    await new UpdateAppointmentUseCase().execute(appointment.id, {
      start_time: "11:00",
    });

    expect(appointmentRepository.findOverlapping).toHaveBeenCalledWith(
      appointment.appointment_date,
      "11:00",
      "12:00",
      appointment.id
    );
  });

  it("does not recalculate the schedule for notes-only edits", async () => {
    await new UpdateAppointmentUseCase().execute(appointment.id, {
      notes: "Nueva nota",
    });

    expect(serviceRepository.findById).not.toHaveBeenCalled();
    expect(appointmentRepository.findOverlapping).not.toHaveBeenCalled();
    expect(appointmentRepository.updateDetailsAtomic).toHaveBeenCalledWith(
      appointment.id,
      expect.objectContaining({ notes: "Nueva nota" })
    );
  });

  it("returns 409 when the atomic update detects a concurrent conflict", async () => {
    vi.mocked(appointmentRepository.updateDetailsAtomic).mockRejectedValue({
      code: "P0001",
      message: "APPOINTMENT_CONFLICT",
    });

    await expect(
      new UpdateAppointmentUseCase().execute(appointment.id, {
        start_time: "11:00",
      })
    ).rejects.toMatchObject({
      statusCode: 409,
      message: "El horario seleccionado ya no está disponible.",
    });
  });
});
