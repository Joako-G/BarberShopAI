import { Request, Response, NextFunction } from "express";
import {
  GetAppearanceSettingsUseCase,
  GetAppointmentSettingsUseCase,
  GetBusinessHoursUseCase,
  GetGeneralSettingsUseCase,
  UpdateAppearanceSettingsUseCase,
  UpdateAppointmentSettingsUseCase,
  UpdateBusinessHoursUseCase,
  UpdateGeneralSettingsUseCase,
} from "../use-cases";
import {
  updateAppearanceSettingsSchema,
  updateAppointmentSettingsSchema,
  updateBusinessHoursSchema,
  updateGeneralSettingsSchema,
} from "../types";
import { success } from "../../../shared/utils";

const getGeneralSettingsUseCase = new GetGeneralSettingsUseCase();
const updateGeneralSettingsUseCase = new UpdateGeneralSettingsUseCase();
const getBusinessHoursUseCase = new GetBusinessHoursUseCase();
const updateBusinessHoursUseCase = new UpdateBusinessHoursUseCase();
const getAppointmentSettingsUseCase = new GetAppointmentSettingsUseCase();
const updateAppointmentSettingsUseCase = new UpdateAppointmentSettingsUseCase();
const getAppearanceSettingsUseCase = new GetAppearanceSettingsUseCase();
const updateAppearanceSettingsUseCase = new UpdateAppearanceSettingsUseCase();

export const settingsController = {
  async getGeneral(
    _req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const settings = await getGeneralSettingsUseCase.execute();
      res.json(success(settings));
    } catch (err) {
      next(err);
    }
  },

  async updateGeneral(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const dto = updateGeneralSettingsSchema.parse(req.body);
      const settings = await updateGeneralSettingsUseCase.execute(dto);
      res.json(success({
        message: "Configuración actualizada correctamente",
        settings,
      }));
    } catch (err) {
      next(err);
    }
  },

  async getBusinessHours(
    _req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const hours = await getBusinessHoursUseCase.execute();
      res.json(success(hours));
    } catch (err) {
      next(err);
    }
  },

  async updateBusinessHours(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const dto = updateBusinessHoursSchema.parse(req.body);
      const hours = await updateBusinessHoursUseCase.execute(dto);
      res.json(success({
        message: "Horarios laborales actualizados correctamente",
        hours,
      }));
    } catch (err) {
      next(err);
    }
  },

  async getAppointmentSettings(
    _req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const settings = await getAppointmentSettingsUseCase.execute();
      res.json(success(settings));
    } catch (err) {
      next(err);
    }
  },

  async updateAppointmentSettings(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const dto = updateAppointmentSettingsSchema.parse(req.body);
      const settings = await updateAppointmentSettingsUseCase.execute(dto);
      res.json(success({
        message: "Configuración de turnos actualizada correctamente",
        settings,
      }));
    } catch (err) {
      next(err);
    }
  },

  async getAppearanceSettings(
    _req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const settings = await getAppearanceSettingsUseCase.execute();
      res.json(success(settings));
    } catch (err) {
      next(err);
    }
  },

  async updateAppearanceSettings(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const dto = updateAppearanceSettingsSchema.parse(req.body);
      const settings = await updateAppearanceSettingsUseCase.execute(dto);
      res.json(success({
        message: "Apariencia actualizada correctamente",
        settings,
      }));
    } catch (err) {
      next(err);
    }
  },
};
