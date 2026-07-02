import { settingsRepository } from "../repositories";
import { AppointmentSettings } from "../types";
import { DEFAULT_APPOINTMENT_SETTINGS } from "./appointment-settings.defaults";

export class GetAppointmentSettingsUseCase {
  async execute(): Promise<AppointmentSettings> {
    const settings = await settingsRepository.findAppointmentSettings();

    if (settings) {
      return settings;
    }

    return settingsRepository.createDefaultAppointmentSettings(
      DEFAULT_APPOINTMENT_SETTINGS
    );
  }
}
