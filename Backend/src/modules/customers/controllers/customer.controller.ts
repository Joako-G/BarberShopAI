import { Request, Response, NextFunction } from "express";
import {
  ListCustomersUseCase,
  GetCustomerByIdUseCase,
  CreateCustomerUseCase,
  UpdateCustomerUseCase,
} from "../use-cases";
import { createCustomerSchema, updateCustomerSchema, customerIdSchema } from "../types";
import { success, created } from "../../../shared/utils";

const listCustomersUseCase = new ListCustomersUseCase();
const getCustomerByIdUseCase = new GetCustomerByIdUseCase();
const createCustomerUseCase = new CreateCustomerUseCase();
const updateCustomerUseCase = new UpdateCustomerUseCase();

export const customerController = {
  async getAll(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const customers = await listCustomersUseCase.execute();
      res.json(success(customers));
    } catch (err) {
      next(err);
    }
  },

  async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = customerIdSchema.parse(req.params);
      const customer = await getCustomerByIdUseCase.execute(id);
      res.json(success(customer));
    } catch (err) {
      next(err);
    }
  },

  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const dto = createCustomerSchema.parse(req.body);
      const customer = await createCustomerUseCase.execute(dto);
      res.status(201).json(created(customer));
    } catch (err) {
      next(err);
    }
  },

  async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = customerIdSchema.parse(req.params);
      const dto = updateCustomerSchema.parse(req.body);
      const customer = await updateCustomerUseCase.execute(id, dto);
      res.json(success(customer));
    } catch (err) {
      next(err);
    }
  },
};