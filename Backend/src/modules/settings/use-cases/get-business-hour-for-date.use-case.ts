import { getCalendarDayOfWeek } from "../../../shared/utils";
import { settingsRepository } from "../repositories";
import { DEFAULT_BUSINESS_HOURS, BusinessHourSchedule } from "./business-hours.defaults";

export class GetBusinessHourForDateUseCase {
  async execute(date: string): Promise<BusinessHourSchedule> {
    const dayOfWeek = getCalendarDayOfWeek(date);
    const fallback = DEFAULT_BUSINESS_HOURS.find(
      (hour) => hour.day_of_week === dayOfWeek
    );

    if (!fallback) {
      return { day_of_week: dayOfWeek, is_open: false, start_time: null, end_time: null };
    }

    const hours = await settingsRepository.findBusinessHours();
    const configured = hours.find((hour) => hour.day_of_week === dayOfWeek);

    if (!configured) {
      return fallback;
    }

    return {
      day_of_week: configured.day_of_week,
      is_open: configured.is_open,
      start_time: configured.start_time,
      end_time: configured.end_time,
    };
  }
}
