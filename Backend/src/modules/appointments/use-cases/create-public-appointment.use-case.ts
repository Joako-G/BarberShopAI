import { appointmentRepository } from "../repositories";
import {
  CreatePublicAppointmentDto,
  AppointmentWithDetails,
} from "../types";
import { NotFoundError } from "../../../shared/errors";
import { loadEnv } from "../../../config/env";
import { GetAppointmentSettingsUseCase } from "../../settings/use-cases";
import { PrepareAppointmentScheduleUseCase } from "./prepare-appointment-schedule.use-case";
import { mapAppointmentDatabaseError } from "../utils/appointment-database-error.utils";

const env = loadEnv();

const barberId = env.DEFAULT_BARBER_PROFILE_ID;
const prepareAppointmentScheduleUseCase =
  new PrepareAppointmentScheduleUseCase();
const getAppointmentSettingsUseCase = new GetAppointmentSettingsUseCase();

export class CreatePublicAppointmentUseCase {
  async execute(dto: CreatePublicAppointmentDto): Promise<AppointmentWithDetails> {
    if (barberId === undefined) {
      throw new NotFoundError("Barber profile not found");
    }

    await prepareAppointmentScheduleUseCase.execute({
      serviceId: dto.service_id,
      appointmentDate: dto.appointment_date,
      startTime: dto.start_time,
    });

    const settings = await getAppointmentSettingsUseCase.execute();
    const status =
      settings.auto_confirm_appointments || !settings.allow_pending_appointments
        ? "confirmed"
        : "pending";

    try {
      return await appointmentRepository.createPublicAtomic({
        full_name: dto.full_name,
        phone: dto.phone,
        email: dto.email ?? null,
        barber_id: barberId,
        service_id: dto.service_id,
        appointment_date: dto.appointment_date,
        start_time: dto.start_time,
        status,
        notes: dto.notes ?? null,
      });
    } catch (error: unknown) {
      throw mapAppointmentDatabaseError(error);
    }
  }
}
