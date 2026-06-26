import { Request, Response, NextFunction } from "express";
import {
  CreateServiceUseCase,
  UpdateServiceUseCase,
  GetServiceByIdUseCase,
  GetServicesUseCase,
  GetAdminServicesUseCase,
  DeleteServiceUseCase,
  ToggleServiceStatusUseCase,
} from "../use-cases";
import {
  createServiceSchema,
  updateServiceSchema,
  serviceIdSchema,
  updateServiceStatusSchema,
} from "../types";
import { success, created } from "../../../shared/utils";

const createServiceUseCase = new CreateServiceUseCase();
const updateServiceUseCase = new UpdateServiceUseCase();
const getServiceByIdUseCase = new GetServiceByIdUseCase();
const getServicesUseCase = new GetServicesUseCase();
const getAdminServicesUseCase = new GetAdminServicesUseCase();
const deleteServiceUseCase = new DeleteServiceUseCase();
const toggleServiceStatusUseCase = new ToggleServiceStatusUseCase();

export const serviceController = {
  async getAll(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const services = await getServicesUseCase.execute();
      res.json(success(services));
    } catch (err) {
      next(err);
    }
  },

  async getAllAdmin(
    _req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const services = await getAdminServicesUseCase.execute();
      res.json(success(services));
    } catch (err) {
      next(err);
    }
  },

  async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = serviceIdSchema.parse(req.params);
      const service = await getServiceByIdUseCase.execute(id);
      res.json(success(service));
    } catch (err) {
      next(err);
    }
  },

  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const dto = createServiceSchema.parse(req.body);
      const service = await createServiceUseCase.execute(dto);
      res.status(201).json(created(service));
    } catch (err) {
      next(err);
    }
  },

  async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = serviceIdSchema.parse(req.params);
      const dto = updateServiceSchema.parse(req.body);
      const service = await updateServiceUseCase.execute(id, dto);
      res.json(success(service));
    } catch (err) {
      next(err);
    }
  },

  async remove(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = serviceIdSchema.parse(req.params);
      await deleteServiceUseCase.execute(id);
      res.status(204).send();
    } catch (err) {
      next(err);
    }
  },

  async toggleStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = serviceIdSchema.parse(req.params);
      const { is_active } = updateServiceStatusSchema.parse(req.body);
      const service = await toggleServiceStatusUseCase.execute(id, is_active);
      res.json(success(service));
    } catch (err) {
      next(err);
    }
  },
};
