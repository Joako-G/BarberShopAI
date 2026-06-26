import { dashboardRepository } from "../repositories";
import { DashboardData } from "../types";
import { getBusinessDateTimeParts } from "../../../shared/utils";

export class GetDashboardStatsUseCase {
  async execute(): Promise<DashboardData> {
    const current = getBusinessDateTimeParts();

    const [stats, upcomingAppointmentsToday] = await Promise.all([
      dashboardRepository.getStats(
        current.date,
        current.year,
        current.month
      ),
      dashboardRepository.getUpcomingAppointmentsToday(
        current.date,
        current.time
      ),
    ]);

    return {
      stats,
      upcomingAppointmentsToday,
    };
  }
}
