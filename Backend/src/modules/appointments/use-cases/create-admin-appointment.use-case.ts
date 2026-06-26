import { loadEnv } from "../../../config/env";
import { appointmentRepository } from "../repositories";
import {
  AppointmentWithDetails,
  CreateAdminAppointmentDto,
} from "../types";
import { PrepareAppointmentScheduleUseCase } from "./prepare-appointment-schedule.use-case";
import { mapAppointmentDatabaseError } from "../utils/appointment-database-error.utils";

const env = loadEnv();
const prepareAppointmentScheduleUseCase =
  new PrepareAppointmentScheduleUseCase();

export class CreateAdminAppointmentUseCase {
  async execute(
    dto: CreateAdminAppointmentDto
  ): Promise<AppointmentWithDetails> {
    await prepareAppointmentScheduleUseCase.execute({
      serviceId: dto.service_id,
      appointmentDate: dto.appointment_date,
      startTime: dto.start_time,
    });

    try {
      return await appointmentRepository.createWithCustomerAtomic({
        customer_id:
          dto.customer_mode === "existing" ? dto.customer_id : null,
        full_name: dto.customer_mode === "new" ? dto.full_name : null,
        phone: dto.customer_mode === "new" ? dto.phone : null,
        email:
          dto.customer_mode === "new" ? (dto.email ?? null) : null,
        barber_id: env.DEFAULT_BARBER_PROFILE_ID,
        service_id: dto.service_id,
        appointment_date: dto.appointment_date,
        start_time: dto.start_time,
        status: "confirmed",
        notes: dto.notes ?? null,
      });
    } catch (error: unknown) {
      throw mapAppointmentDatabaseError(error);
    }
  }
}
