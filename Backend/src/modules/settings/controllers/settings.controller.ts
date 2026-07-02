import { Request, Response, NextFunction } from "express";
import {
  GetGeneralSettingsUseCase,
  UpdateGeneralSettingsUseCase,
} from "../use-cases";
import { updateGeneralSettingsSchema } from "../types";
import { success } from "../../../shared/utils";

const getGeneralSettingsUseCase = new GetGeneralSettingsUseCase();
const updateGeneralSettingsUseCase = new UpdateGeneralSettingsUseCase();

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
};

