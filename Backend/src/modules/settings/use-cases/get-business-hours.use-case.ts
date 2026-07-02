import { settingsRepository } from "../repositories";
import { BusinessHour } from "../types";
import { DEFAULT_BUSINESS_HOURS } from "./business-hours.defaults";

export class GetBusinessHoursUseCase {
  async execute(): Promise<BusinessHour[]> {
    const hours = await settingsRepository.findBusinessHours();

    if (hours.length === 7) {
      return hours;
    }

    return DEFAULT_BUSINESS_HOURS.map((hour) => ({
      ...hour,
      id: `fallback-${hour.day_of_week}`,
      created_at: "",
      updated_at: "",
    }));
  }
}
