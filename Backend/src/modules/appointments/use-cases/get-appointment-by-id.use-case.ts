import { appointmentRepository } from "../repositories";
import { AppointmentWithDetails } from "../types";
import { NotFoundError } from "../../../shared/errors";

export class GetAppointmentByIdUseCase {
  async execute(id: string): Promise<AppointmentWithDetails> {
    const appointment = await appointmentRepository.findById(id);

    if (!appointment) {
      throw new NotFoundError("Appointment not found");
    }

    return appointment;
  }
}
