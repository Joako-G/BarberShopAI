import { appointmentRepository } from "../repositories";
import { AppointmentStatus, AppointmentWithDetails } from "../types";
import { mapAppointmentDatabaseError } from "../utils/appointment-database-error.utils";

export class TransitionAppointmentStatusUseCase {
  async execute(
    id: string,
    nextStatus: AppointmentStatus
  ): Promise<AppointmentWithDetails> {
    try {
      return await appointmentRepository.updateStatusAtomic(id, nextStatus);
    } catch (error: unknown) {
      throw mapAppointmentDatabaseError(error);
    }
  }
}
