import { appointmentRepository } from "../repositories";
import { AppointmentWithDetails } from "../types";
import { mapAppointmentDatabaseError } from "../utils/appointment-database-error.utils";

export class ConfirmAppointmentUseCase {
  async execute(id: string): Promise<AppointmentWithDetails> {
    try {
      return await appointmentRepository.confirmAtomic(id);
    } catch (error: unknown) {
      throw mapAppointmentDatabaseError(error);
    }
  }
}
