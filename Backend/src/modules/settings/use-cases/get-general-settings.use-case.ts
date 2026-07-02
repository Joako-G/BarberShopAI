import { settingsRepository } from "../repositories";
import { BusinessSettings } from "../types";

export class GetGeneralSettingsUseCase {
  async execute(): Promise<BusinessSettings> {
    const settings = await settingsRepository.findGeneral();

    if (settings) {
      return settings;
    }

    return settingsRepository.createDefault();
  }
}

