import { Request, Response } from "express";
import { success } from "../../../shared/utils/api-response";
import { GetDashboardStatsUseCase } from "../use-cases";

const getDashboardStatsUseCase = new GetDashboardStatsUseCase();

export const dashboardController = {
  async getStats(_req: Request, res: Response): Promise<void> {
    const stats = await getDashboardStatsUseCase.execute();
    res.json(success(stats));
  },
};
