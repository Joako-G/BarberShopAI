import { appointmentRepository } from "../repositories";
import { serviceRepository } from "../../services/repositories";
import {
  GetAppointmentSettingsUseCase,
  GetEffectiveBusinessHourForDateUseCase,
} from "../../settings/use-cases";
import { NotFoundError, ValidationError } from "../../../shared/errors";
import { getBusinessDateTimeParts } from "../../../shared/utils";
import {
  formatMinutesAsTime,
  getServiceTotalMinutes,
  isBeforeBookingNotice,
  isBeyondMaxBookingDate,
  parseTimeToMinutes,
} from "./appointment-time.utils";

const getEffectiveBusinessHourForDateUseCase = new GetEffectiveBusinessHourForDateUseCase();
const getAppointmentSettingsUseCase = new GetAppointmentSettingsUseCase();

export class GetAvailableSlotsUseCase {
  async execute(
    serviceId: string,
    date: string,
    excludeAppointmentId?: string
  ): Promise<string[]> {
    const service = await serviceRepository.findById(serviceId);

    if (!service) {
      throw new NotFoundError("Service not found");
    }

    if (!service.is_active) {
      throw new ValidationError("Service is not available for booking");
    }

    const current = getBusinessDateTimeParts();
    const todayStr = current.date;
    const appointmentSettings = await getAppointmentSettingsUseCase.execute();

    if (date < todayStr) {
      throw new ValidationError("Cannot check availability for past dates");
    }

    if (isBeyondMaxBookingDate(date, appointmentSettings.max_booking_days_ahead)) {
      return [];
    }

    const workingHours = await getEffectiveBusinessHourForDateUseCase.execute(date);

    if (!workingHours.is_open || !workingHours.start_time || !workingHours.end_time) {
      return [];
    }

    const totalMinutes = getServiceTotalMinutes(
      service,
      appointmentSettings.default_buffer_minutes
    );
    const workStartMinutes = parseTimeToMinutes(workingHours.start_time);
    const workEndMinutes = parseTimeToMinutes(workingHours.end_time);

    const appointments = await appointmentRepository.findByDate(
      date,
      excludeAppointmentId
    );

    const slots: string[] = [];

    for (
      let slotStartMinutes = workStartMinutes;
      slotStartMinutes < workEndMinutes;
      slotStartMinutes += appointmentSettings.slot_interval_minutes
    ) {
      const slotEndMinutes = slotStartMinutes + totalMinutes;

      if (slotEndMinutes > workEndMinutes) {
        break;
      }

      if (
        isBeforeBookingNotice(
          date,
          slotStartMinutes,
          appointmentSettings.min_booking_notice_minutes
        )
      ) {
        continue;
      }

      const slotStartTime = formatMinutesAsTime(slotStartMinutes);

      const hasConflict = appointments.some((apt) => {
        const aptStartMinutes = parseTimeToMinutes(apt.start_time);
        const aptEndMinutes = parseTimeToMinutes(apt.end_time);
        return slotStartMinutes < aptEndMinutes && slotEndMinutes > aptStartMinutes;
      });

      if (!hasConflict) {
        slots.push(slotStartTime);
      }
    }

    return slots;
  }
}
