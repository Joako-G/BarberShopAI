import { NotFoundError, ValidationError } from "../../../shared/errors";
import { isBusinessDateTimePastOrNow } from "../../../shared/utils";
import { serviceRepository } from "../../services/repositories";
import { GetBusinessHourForDateUseCase } from "../../settings/use-cases";
import {
  assertWithinWorkingHours,
  formatMinutesAsTime,
  getServiceTotalMinutes,
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

export class PrepareAppointmentScheduleUseCase {
  async execute(
    input: PrepareAppointmentScheduleInput
  ): Promise<PreparedAppointmentSchedule> {
    const workingHours = await getBusinessHourForDateUseCase.execute(
      input.appointmentDate
    );

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

    const service = await serviceRepository.findById(input.serviceId);

    if (!service) {
      throw new NotFoundError("Service not found");
    }

    if (!service.is_active) {
      throw new ValidationError("Service is not available for booking");
    }

    const startMinutes = parseTimeToMinutes(input.startTime);
    const endMinutes = startMinutes + getServiceTotalMinutes(service);
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
