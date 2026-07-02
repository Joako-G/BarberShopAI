import { Request, Response, NextFunction } from "express";
import {
  GetBusinessHoursUseCase,
  GetGeneralSettingsUseCase,
  UpdateBusinessHoursUseCase,
  UpdateGeneralSettingsUseCase,
} from "../use-cases";
import { updateBusinessHoursSchema, updateGeneralSettingsSchema } from "../types";
import { success } from "../../../shared/utils";

const getGeneralSettingsUseCase = new GetGeneralSettingsUseCase();
const updateGeneralSettingsUseCase = new UpdateGeneralSettingsUseCase();
const getBusinessHoursUseCase = new GetBusinessHoursUseCase();
const updateBusinessHoursUseCase = new UpdateBusinessHoursUseCase();

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
};
