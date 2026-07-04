import { settingsRepository } from "../repositories";
import { AppearanceSettings, UpdateAppearanceSettingsDto } from "../types";
import { GetAppearanceSettingsUseCase } from "./get-appearance-settings.use-case";

const getAppearanceSettingsUseCase = new GetAppearanceSettingsUseCase();

export class UpdateAppearanceSettingsUseCase {
  async execute(dto: UpdateAppearanceSettingsDto): Promise<AppearanceSettings> {
    const current = await getAppearanceSettingsUseCase.execute();
    return settingsRepository.updateAppearanceSettings(current.id, dto);
  }
}
