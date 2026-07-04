import { settingsRepository } from "../repositories";
import { AppearanceSettings } from "../types";
import { DEFAULT_APPEARANCE_SETTINGS } from "./appearance-settings.defaults";

export class GetAppearanceSettingsUseCase {
  async execute(): Promise<AppearanceSettings> {
    const settings = await settingsRepository.findAppearanceSettings();

    if (settings) {
      return settings;
    }

    return settingsRepository.createDefaultAppearanceSettings(
      DEFAULT_APPEARANCE_SETTINGS
    );
  }
}
