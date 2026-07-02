import { settingsRepository } from "../repositories";
import { BusinessSettings, UpdateGeneralSettingsDto } from "../types";

export class UpdateGeneralSettingsUseCase {
  async execute(dto: UpdateGeneralSettingsDto): Promise<BusinessSettings> {
    const existing = await settingsRepository.findGeneral();
    const settings = existing ?? await settingsRepository.createDefault();

    return settingsRepository.updateGeneral(settings.id, dto);
  }
}

