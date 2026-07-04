import { NotFoundError } from "../../../shared/errors";
import { settingsRepository } from "../repositories";
import { CalendarException, CalendarExceptionDto } from "../types";

export class UpdateCalendarExceptionUseCase {
  async execute(
    id: string,
    dto: CalendarExceptionDto
  ): Promise<CalendarException> {
    const exception = await settingsRepository.updateCalendarException(id, dto);

    if (!exception) {
      throw new NotFoundError("Calendar exception not found");
    }

    return exception;
  }
}
