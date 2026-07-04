import { settingsRepository } from "../repositories";
import { CalendarException } from "../types";

export class ListCalendarExceptionsUseCase {
  async execute(): Promise<CalendarException[]> {
    return settingsRepository.findCalendarExceptions();
  }
}
