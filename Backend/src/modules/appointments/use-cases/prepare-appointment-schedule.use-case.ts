import { NotFoundError, ValidationError } from "../../../shared/errors";
import { isBusinessDateTimePastOrNow } from "../../../shared/utils";
import { serviceRepository } from "../../services/repositories";
import {
  GetAppointmentSettingsUseCase,
  GetBusinessHourForDateUseCase,
} from "../../settings/use-cases";
import {
  assertWithinWorkingHours,
  formatMinutesAsTime,
  getServiceTotalMinutes,
  isBeforeBookingNotice,
  isBeyondMaxBookingDate,
  parseTimeToMinutes,
} from "./appointment-time.utils";
import { ValidateAppointmentConflictUseCase } from "./validate-appointment-conflict.use-case";

interface PrepareAppointmentScheduleInput {
  serviceId: string;
  appointmentDate: string;
  startTime: string;
  excludeAppointmentId?: string;
}

interface PreparedAppointmentSchedule {
  endTime: string;
}

const validateAppointmentConflictUseCase =
  new ValidateAppointmentConflictUseCase();
const getBusinessHourForDateUseCase = new GetBusinessHourForDateUseCase();
const getAppointmentSettingsUseCase = new GetAppointmentSettingsUseCase();

export class PrepareAppointmentScheduleUseCase {
  async execute(
    input: PrepareAppointmentScheduleInput
  ): Promise<PreparedAppointmentSchedule> {
    const workingHours = await getBusinessHourForDateUseCase.execute(
      input.appointmentDate
    );
    const appointmentSettings = await getAppointmentSettingsUseCase.execute();

    if (!workingHours.is_open || !workingHours.start_time || !workingHours.end_time) {
      throw new ValidationError(
        "Appointments are not available for this day"
      );
    }

    if (
      isBusinessDateTimePastOrNow(
        input.appointmentDate,
        input.startTime
      )
    ) {
      throw new ValidationError("Cannot create appointments in the past");
    }

    if (
      isBeyondMaxBookingDate(
        input.appointmentDate,
        appointmentSettings.max_booking_days_ahead
      )
    ) {
      throw new ValidationError("No se pueden reservar turnos con tanta anticipación.");
    }

    const service = await serviceRepository.findById(input.serviceId);

    if (!service) {
      throw new NotFoundError("Service not found");
    }

    if (!service.is_active) {
      throw new ValidationError("Service is not available for booking");
    }

    const startMinutes = parseTimeToMinutes(input.startTime);
    if (
      isBeforeBookingNotice(
        input.appointmentDate,
        startMinutes,
        appointmentSettings.min_booking_notice_minutes
      )
    ) {
      throw new ValidationError("El turno no cumple con la anticipación mínima.");
    }

    const endMinutes =
      startMinutes +
      getServiceTotalMinutes(
        service,
        appointmentSettings.default_buffer_minutes
      );
    assertWithinWorkingHours(startMinutes, endMinutes, workingHours);

    const endTime = formatMinutesAsTime(endMinutes);

    await validateAppointmentConflictUseCase.execute(
      input.appointmentDate,
      input.startTime,
      endTime,
      input.excludeAppointmentId
    );

    return { endTime };
  }
}
