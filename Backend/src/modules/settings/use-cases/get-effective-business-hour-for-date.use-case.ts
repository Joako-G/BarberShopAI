import { getCalendarDayOfWeek } from "../../../shared/utils";
import { settingsRepository } from "../repositories";
import { BusinessHourSchedule } from "./business-hours.defaults";
import { GetBusinessHourForDateUseCase } from "./get-business-hour-for-date.use-case";

const getBusinessHourForDateUseCase = new GetBusinessHourForDateUseCase();

export class GetEffectiveBusinessHourForDateUseCase {
  async execute(date: string): Promise<BusinessHourSchedule> {
    const exceptions = await settingsRepository.findCalendarExceptionsForDate(date);
    const closedException = exceptions.find(
      (exception) =>
        exception.type === "CLOSED_DAY" || exception.type === "VACATION"
    );

    if (closedException) {
      return {
        day_of_week: getCalendarDayOfWeek(date),
        is_open: false,
        start_time: null,
        end_time: null,
      };
    }

    const specialHours = exceptions.find(
      (exception) => exception.type === "SPECIAL_HOURS"
    );

    if (specialHours) {
      return {
        day_of_week: getCalendarDayOfWeek(date),
        is_open: true,
        start_time: specialHours.special_start_time,
        end_time: specialHours.special_end_time,
      };
    }

    return getBusinessHourForDateUseCase.execute(date);
  }
}
