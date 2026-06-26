import { Request, Response, NextFunction } from "express";
import { CreateBarberUseCase } from "../use-cases";
import { createBarberSchema } from "../types";
import { success, created } from "../../../shared/utils";

const createBarberUseCase = new CreateBarberUseCase();

export const barberController = {
  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const dto = createBarberSchema.parse(req.body);
      const result = await createBarberUseCase.execute(dto);
      res.status(201).json(created(result));
    } catch (err) {
      next(err);
    }
  },
};