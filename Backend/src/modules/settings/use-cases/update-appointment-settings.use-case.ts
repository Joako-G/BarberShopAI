import { settingsRepository } from "../repositories";
import { AppointmentSettings, UpdateAppointmentSettingsDto } from "../types";
import { GetAppointmentSettingsUseCase } from "./get-appointment-settings.use-case";

const getAppointmentSettingsUseCase = new GetAppointmentSettingsUseCase();

export class UpdateAppointmentSettingsUseCase {
  async execute(dto: UpdateAppointmentSettingsDto): Promise<AppointmentSettings> {
    const current = await getAppointmentSettingsUseCase.execute();
    return settingsRepository.updateAppointmentSettings(current.id, dto);
  }
}
