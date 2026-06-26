import { useEffect, useState } from "react";
import { getStats } from "../services/statsApi";
import type { DashboardStats, UpcomingAppointment } from "../types/stats";

export function useDashboard() {
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [upcomingAppointments, setUpcomingAppointments] = useState<UpcomingAppointment[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const requestId = window.setTimeout(() => {
            const loadStats = async () => {
                try {
                    const data = await getStats();
                    setStats(data.stats);
                    setUpcomingAppointments(data.upcomingAppointmentsToday);
                } catch {
                    setError("No se pudieron cargar las estadísticas.");
                } finally {
                    setLoading(false);
                }
            };

            void loadStats();
        }, 0);

        return () => window.clearTimeout(requestId);
    }, []);

    return { stats, upcomingAppointments, loading, error };
}
