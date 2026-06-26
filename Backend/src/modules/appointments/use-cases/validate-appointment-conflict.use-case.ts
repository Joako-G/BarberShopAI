import { ConflictError } from "../../../shared/errors";
import { appointmentRepository } from "../repositories";

export class ValidateAppointmentConflictUseCase {
  async execute(
    appointmentDate: string,
    startTime: string,
    endTime: string,
    excludeAppointmentId?: string
  ): Promise<void> {
    const overlapping = await appointmentRepository.findOverlapping(
      appointmentDate,
      startTime,
      endTime,
      excludeAppointmentId
    );

    if (overlapping.length > 0) {
      throw new ConflictError("El horario seleccionado ya no está disponible.");
    }
  }
}
