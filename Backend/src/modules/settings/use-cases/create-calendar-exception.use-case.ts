import { settingsRepository } from "../repositories";
import { CalendarException, CalendarExceptionDto } from "../types";

export class CreateCalendarExceptionUseCase {
  async execute(dto: CalendarExceptionDto): Promise<CalendarException> {
    return settingsRepository.createCalendarException(dto);
  }
}
