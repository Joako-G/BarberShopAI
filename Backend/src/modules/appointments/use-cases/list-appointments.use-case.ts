import { appointmentRepository } from "../repositories";
import { AppointmentWithDetails, ListAppointmentsQuery } from "../types";

export class ListAppointmentsUseCase {
  async execute(filters: ListAppointmentsQuery): Promise<AppointmentWithDetails[]> {
    return appointmentRepository.findAll(filters);
  }
}
