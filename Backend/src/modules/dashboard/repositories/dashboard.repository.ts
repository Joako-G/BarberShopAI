import { supabaseAdmin } from "../../../config/supabase";
import { DashboardStats, UpcomingAppointment } from "../types";

export const dashboardRepository = {
  async getAppointmentsTodayCounts(date: string): Promise<{
    total: number;
    pending: number;
    confirmed: number;
    completed: number;
    cancelled: number;
  }> {
    const { data, error } = await supabaseAdmin
      .from("appointments")
      .select("status")
      .eq("appointment_date", date);

    if (error) throw error;

    const counts = {
      total: data.length,
      pending: 0,
      confirmed: 0,
      completed: 0,
      cancelled: 0,
    };

    for (const appointment of data) {
      if (appointment.status === "pending") counts.pending++;
      else if (appointment.status === "confirmed") counts.confirmed++;
      else if (appointment.status === "completed") counts.completed++;
      else if (appointment.status === "cancelled") counts.cancelled++;
    }

    return counts;
  },

  async getUpcomingAppointmentsToday(date: string, currentTime: string): Promise<UpcomingAppointment[]> {
    const { data, error } = await supabaseAdmin
      .from("appointments")
      .select("id, start_time, status, customer_id, service_id")
      .eq("appointment_date", date)
      .in("status", ["pending", "confirmed"])
      .order("start_time", { ascending: true });

    if (error) throw error;

    const filteredData = data.filter((apt) => {
      const aptTimeOnly = apt.start_time.substring(0, 5);
      return aptTimeOnly >= currentTime;
    });

    if (filteredData.length === 0) return [];

    const customerIds = [...new Set(filteredData.map((apt) => apt.customer_id))];
    const serviceIds = [...new Set(filteredData.map((apt) => apt.service_id))];

    const [customersData, servicesData] = await Promise.all([
      supabaseAdmin.from("customers").select("id, full_name").in("id", customerIds),
      supabaseAdmin.from("services").select("id, name").in("id", serviceIds),
    ]);

    if (customersData.error) throw customersData.error;
    if (servicesData.error) throw servicesData.error;

    const customersMap = new Map(customersData.data.map((c) => [c.id, c.full_name]));
    const servicesMap = new Map(servicesData.data.map((s) => [s.id, s.name]));

    return filteredData.map((apt) => ({
      id: apt.id,
      start_time: apt.start_time.substring(0, 5),
      customer_name: customersMap.get(apt.customer_id) ?? "Unknown",
      service_name: servicesMap.get(apt.service_id) ?? "Unknown",
      status: apt.status,
    }));
  },

  async getAppointmentsForMonth(year: number, month: number): Promise<number> {
    const startDate = `${year}-${String(month).padStart(2, "0")}-01`;
    const endDate = month === 12
      ? `${year + 1}-01-01`
      : `${year}-${String(month + 1).padStart(2, "0")}-01`;

    const { count, error } = await supabaseAdmin
      .from("appointments")
      .select("*", { count: "exact", head: true })
      .gte("appointment_date", startDate)
      .lt("appointment_date", endDate);

    if (error) throw error;
    return count ?? 0;
  },

  async getCustomersCount(): Promise<number> {
    const { count, error } = await supabaseAdmin
      .from("customers")
      .select("*", { count: "exact", head: true });

    if (error) throw error;
    return count ?? 0;
  },

  async getActiveServicesCount(): Promise<number> {
    const { count, error } = await supabaseAdmin
      .from("services")
      .select("*", { count: "exact", head: true })
      .eq("is_active", true);

    if (error) throw error;
    return count ?? 0;
  },

  async getStats(
    businessDate: string,
    businessYear: number,
    businessMonth: number
  ): Promise<DashboardStats> {
    const [todayCounts, customersCount, activeServicesCount, appointmentsMonth] = await Promise.all([
      this.getAppointmentsTodayCounts(businessDate),
      this.getCustomersCount(),
      this.getActiveServicesCount(),
      this.getAppointmentsForMonth(businessYear, businessMonth),
    ]);

    return {
      appointmentsToday: todayCounts.total,
      pendingAppointmentsToday: todayCounts.pending,
      confirmedAppointmentsToday: todayCounts.confirmed,
      completedAppointmentsToday: todayCounts.completed,
      cancelledAppointmentsToday: todayCounts.cancelled,
      customersCount,
      activeServicesCount,
      appointmentsMonth,
    };
  },
};
