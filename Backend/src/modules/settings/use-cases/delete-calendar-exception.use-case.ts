import { NotFoundError } from "../../../shared/errors";
import { settingsRepository } from "../repositories";

export class DeleteCalendarExceptionUseCase {
  async execute(id: string): Promise<void> {
    const deleted = await settingsRepository.deleteCalendarException(id);

    if (!deleted) {
      throw new NotFoundError("Calendar exception not found");
    }
  }
}
