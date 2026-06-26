export interface DashboardStats {
    appointmentsToday: number;
    pendingAppointmentsToday: number;
    confirmedAppointmentsToday: number;
    completedAppointmentsToday: number;
    cancelledAppointmentsToday: number;
    customersCount: number;
    activeServicesCount: number;
    appointmentsMonth: number;
}

export interface UpcomingAppointment {
    id: string;
    start_time: string;
    customer_name: string;
    service_name: string;
    status: string;
}

export interface DashboardData {
    stats: DashboardStats;
    upcomingAppointmentsToday: UpcomingAppointment[];
}
