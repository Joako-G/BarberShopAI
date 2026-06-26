import { NotFoundError, ValidationError } from "../../../shared/errors";
import { appointmentRepository } from "../repositories";
import { AppointmentWithDetails, UpdateAppointmentDto } from "../types";
import { PrepareAppointmentScheduleUseCase } from "./prepare-appointment-schedule.use-case";
import { mapAppointmentDatabaseError } from "../utils/appointment-database-error.utils";

const finalStatuses = ["completed", "cancelled", "no_show"] as const;
const prepareAppointmentScheduleUseCase =
  new PrepareAppointmentScheduleUseCase();

export class UpdateAppointmentUseCase {
  async execute(
    id: string,
    dto: UpdateAppointmentDto
  ): Promise<AppointmentWithDetails> {
    const appointment = await appointmentRepository.findById(id);

    if (!appointment) {
      throw new NotFoundError("Appointment not found");
    }

    if (finalStatuses.includes(appointment.status as (typeof finalStatuses)[number])) {
      throw new ValidationError("Final-state appointments cannot be edited");
    }

    const serviceId = dto.service_id ?? appointment.service_id;
    const appointmentDate =
      dto.appointment_date ?? appointment.appointment_date;
    const startTime = dto.start_time ?? appointment.start_time.slice(0, 5);
    const scheduleChanged =
      serviceId !== appointment.service_id ||
      appointmentDate !== appointment.appointment_date ||
      startTime !== appointment.start_time.slice(0, 5);

    if (scheduleChanged) {
      await prepareAppointmentScheduleUseCase.execute({
        serviceId,
        appointmentDate,
        startTime,
        excludeAppointmentId: id,
      });
    }

    try {
      return await appointmentRepository.updateDetailsAtomic(id, {
        service_id: serviceId,
        appointment_date: appointmentDate,
        start_time: startTime,
        notes: dto.notes === undefined ? appointment.notes : dto.notes,
      });
    } catch (error: unknown) {
      throw mapAppointmentDatabaseError(error);
    }
  }
}
