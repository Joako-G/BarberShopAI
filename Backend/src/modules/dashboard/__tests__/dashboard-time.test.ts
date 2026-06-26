import { describe, expect, it, vi } from "vitest";
import { dashboardRepository } from "../repositories";
import { GetDashboardStatsUseCase } from "../use-cases";

describe("dashboard business time", () => {
  it("queries the previous Buenos Aires day when UTC crossed midnight", async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-06-25T01:30:00.000Z"));

    const stats = {
      appointmentsToday: 0,
      pendingAppointmentsToday: 0,
      confirmedAppointmentsToday: 0,
      completedAppointmentsToday: 0,
      cancelledAppointmentsToday: 0,
      customersCount: 0,
      activeServicesCount: 0,
      appointmentsMonth: 0,
    };
    const getStats = vi.spyOn(dashboardRepository, "getStats").mockResolvedValue(stats);
    const getUpcoming = vi
      .spyOn(dashboardRepository, "getUpcomingAppointmentsToday")
      .mockResolvedValue([]);

    await new GetDashboardStatsUseCase().execute();

    expect(getStats).toHaveBeenCalledWith("2026-06-24", 2026, 6);
    expect(getUpcoming).toHaveBeenCalledWith("2026-06-24", "22:30");
  });
});
