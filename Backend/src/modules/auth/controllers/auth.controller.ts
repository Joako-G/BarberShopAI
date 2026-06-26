import { Request, Response, NextFunction } from "express";
import { LoginUseCase } from "../use-cases";
import { loginSchema } from "../types";
import { success } from "../../../shared/utils";

const loginUseCase = new LoginUseCase();

export const authController = {
  async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const dto = loginSchema.parse(req.body);
      const result = await loginUseCase.execute(dto);
      res.json(success(result));
    } catch (err) {
      next(err);
    }
  },
};