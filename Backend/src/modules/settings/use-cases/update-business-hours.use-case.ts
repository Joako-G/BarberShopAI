import { settingsRepository } from "../repositories";
import { BusinessHour, UpdateBusinessHoursDto } from "../types";

export class UpdateBusinessHoursUseCase {
  async execute(dto: UpdateBusinessHoursDto): Promise<BusinessHour[]> {
    const normalized = dto.hours
      .map((hour) => ({
        ...hour,
        start_time: hour.is_open ? hour.start_time : null,
        end_time: hour.is_open ? hour.end_time : null,
      }))
      .sort((a, b) => a.day_of_week - b.day_of_week);

    return settingsRepository.upsertBusinessHours(normalized);
  }
}
