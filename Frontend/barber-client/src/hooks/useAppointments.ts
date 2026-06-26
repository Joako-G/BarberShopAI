import axios from "axios";
import { useCallback, useEffect, useState } from "react";
import {
    changeAppointmentStatus,
    getAllAppointments,
} from "../services/appointmentsApi";
import type {
    Appointment,
    AppointmentAction,
    AppointmentFilters,
} from "../types/appointment";

function getErrorMessage(error: unknown): string {
    if (axios.isAxiosError(error)) {
        const backendMessage = error.response?.data?.error?.message;

        if (typeof backendMessage === "string") {
            return backendMessage;
        }
    }

    if (error instanceof Error) {
        return error.message;
    }

    return "No se pudieron cargar los turnos.";
}

export function useAppointments(initialFilters: AppointmentFilters) {
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [filters, setFilters] = useState<AppointmentFilters>(initialFilters);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [updatingId, setUpdatingId] = useState<string | null>(null);

    const fetchAppointments = useCallback(async () => {
        try {
            const data = await getAllAppointments(filters);
            setAppointments(data);
        } catch (loadError) {
            setError(getErrorMessage(loadError));
        } finally {
            setLoading(false);
        }
    }, [filters]);

    useEffect(() => {
        const requestId = window.setTimeout(() => {
            void fetchAppointments();
        }, 0);

        return () => window.clearTimeout(requestId);
    }, [fetchAppointments]);

    const applyFilters = (nextFilters: AppointmentFilters) => {
        setLoading(true);
        setError(null);
        setFilters(nextFilters);
    };

    const reload = async () => {
        setLoading(true);
        setError(null);
        await fetchAppointments();
    };

    const updateStatus = async (
        appointmentId: string,
        action: AppointmentAction
    ): Promise<{ success: boolean; errorMessage?: string }> => {
        setUpdatingId(appointmentId);
        setError(null);

        try {
            const updatedAppointment = await changeAppointmentStatus(
                appointmentId,
                action
            );

            setAppointments((currentAppointments) =>
                currentAppointments.map((appointment) =>
                    appointment.id === appointmentId
                        ? updatedAppointment
                        : appointment
                )
            );

            return { success: true };
        } catch (updateError) {
            const errorMessage = getErrorMessage(updateError);
            return { success: false, errorMessage };
        } finally {
            setUpdatingId(null);
        }
    };

    return {
        appointments,
        filters,
        loading,
        error,
        updatingId,
        applyFilters,
        reload,
        updateStatus,
    };
}
