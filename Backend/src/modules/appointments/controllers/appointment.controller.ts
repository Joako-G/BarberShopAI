import { Request, Response, NextFunction } from "express";
import {
  CreatePublicAppointmentUseCase,
  CreateAdminAppointmentUseCase,
  UpdateAppointmentUseCase,
  ListAppointmentsUseCase,
  GetAppointmentByIdUseCase,
  ConfirmAppointmentUseCase,
  CancelAppointmentUseCase,
  CompleteAppointmentUseCase,
  MarkNoShowAppointmentUseCase,
  GetAvailableSlotsUseCase,
} from "../use-cases";
import {
  createPublicAppointmentSchema,
  createAdminAppointmentSchema,
  updateAppointmentSchema,
  appointmentIdSchema,
  availableSlotsQuerySchema,
  listAppointmentsQuerySchema,
} from "../types";
import { success } from "../../../shared/utils";

const createPublicAppointmentUseCase = new CreatePublicAppointmentUseCase();
const createAdminAppointmentUseCase = new CreateAdminAppointmentUseCase();
const updateAppointmentUseCase = new UpdateAppointmentUseCase();
const listAppointmentsUseCase = new ListAppointmentsUseCase();
const getAppointmentByIdUseCase = new GetAppointmentByIdUseCase();
const confirmAppointmentUseCase = new ConfirmAppointmentUseCase();
const cancelAppointmentUseCase = new CancelAppointmentUseCase();
const completeAppointmentUseCase = new CompleteAppointmentUseCase();
const markNoShowAppointmentUseCase = new MarkNoShowAppointmentUseCase();
const getAvailableSlotsUseCase = new GetAvailableSlotsUseCase();

export const appointmentController = {
  async createPublic(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const dto = createPublicAppointmentSchema.parse(req.body);
      const appointment = await createPublicAppointmentUseCase.execute(dto);
      res.status(201).json(success(appointment));
    } catch (err) {
      next(err);
    }
  },

  async createAdmin(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const dto = createAdminAppointmentSchema.parse(req.body);
      const appointment = await createAdminAppointmentUseCase.execute(dto);
      res.status(201).json(success(appointment, 201));
    } catch (err) {
      next(err);
    }
  },

  async getAll(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const filters = listAppointmentsQuerySchema.parse(req.query);
      const appointments = await listAppointmentsUseCase.execute(filters);
      res.json(success(appointments));
    } catch (err) {
      next(err);
    }
  },

  async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = appointmentIdSchema.parse(req.params);
      const appointment = await getAppointmentByIdUseCase.execute(id);
      res.json(success(appointment));
    } catch (err) {
      next(err);
    }
  },

  async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = appointmentIdSchema.parse(req.params);
      const dto = updateAppointmentSchema.parse(req.body);
      const appointment = await updateAppointmentUseCase.execute(id, dto);
      res.json(success(appointment));
    } catch (err) {
      next(err);
    }
  },

  async confirm(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = appointmentIdSchema.parse(req.params);
      const appointment = await confirmAppointmentUseCase.execute(id);
      res.json(success(appointment));
    } catch (err) {
      next(err);
    }
  },

  async cancel(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = appointmentIdSchema.parse(req.params);
      const appointment = await cancelAppointmentUseCase.execute(id);
      res.json(success(appointment));
    } catch (err) {
      next(err);
    }
  },

  async complete(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = appointmentIdSchema.parse(req.params);
      const appointment = await completeAppointmentUseCase.execute(id);
      res.json(success(appointment));
    } catch (err) {
      next(err);
    }
  },

  async noShow(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = appointmentIdSchema.parse(req.params);
      const appointment = await markNoShowAppointmentUseCase.execute(id);
      res.json(success(appointment));
    } catch (err) {
      next(err);
    }
  },

  async getAvailableSlots(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { serviceId, date, excludeAppointmentId } =
        availableSlotsQuerySchema.parse(req.query);
      const slots = await getAvailableSlotsUseCase.execute(
        serviceId,
        date,
        excludeAppointmentId
      );
      res.json(success(slots));
    } catch (err) {
      next(err);
    }
  },
};
