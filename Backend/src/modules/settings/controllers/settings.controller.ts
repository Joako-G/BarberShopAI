import { Request, Response, NextFunction } from "express";
import {
  CreateCalendarExceptionUseCase,
  DeleteCalendarExceptionUseCase,
  GetAppearanceSettingsUseCase,
  GetAppointmentSettingsUseCase,
  GetBusinessHoursUseCase,
  GetGeneralSettingsUseCase,
  ListCalendarExceptionsUseCase,
  UpdateAppearanceSettingsUseCase,
  UpdateAppointmentSettingsUseCase,
  UpdateBusinessHoursUseCase,
  UpdateCalendarExceptionUseCase,
  UpdateGeneralSettingsUseCase,
} from "../use-cases";
import {
  calendarExceptionIdSchema,
  calendarExceptionPayloadSchema,
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
const listCalendarExceptionsUseCase = new ListCalendarExceptionsUseCase();
const createCalendarExceptionUseCase = new CreateCalendarExceptionUseCase();
const updateCalendarExceptionUseCase = new UpdateCalendarExceptionUseCase();
const deleteCalendarExceptionUseCase = new DeleteCalendarExceptionUseCase();

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

  async listCalendarExceptions(
    _req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const exceptions = await listCalendarExceptionsUseCase.execute();
      res.json(success(exceptions));
    } catch (err) {
      next(err);
    }
  },

  async createCalendarException(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const dto = calendarExceptionPayloadSchema.parse(req.body);
      const exception = await createCalendarExceptionUseCase.execute(dto);
      res.status(201).json(success({
        message: "Excepción de calendario creada correctamente",
        exception,
      }));
    } catch (err) {
      next(err);
    }
  },

  async updateCalendarException(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { id } = calendarExceptionIdSchema.parse(req.params);
      const dto = calendarExceptionPayloadSchema.parse(req.body);
      const exception = await updateCalendarExceptionUseCase.execute(id, dto);
      res.json(success({
        message: "Excepción de calendario actualizada correctamente",
        exception,
      }));
    } catch (err) {
      next(err);
    }
  },

  async deleteCalendarException(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { id } = calendarExceptionIdSchema.parse(req.params);
      await deleteCalendarExceptionUseCase.execute(id);
      res.json(success({
        message: "Excepción de calendario eliminada correctamente",
      }));
    } catch (err) {
      next(err);
    }
  },
};
