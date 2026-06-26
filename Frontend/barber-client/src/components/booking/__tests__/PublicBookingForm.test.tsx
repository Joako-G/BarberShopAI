import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { PublicBookingForm } from "../PublicBookingForm";

const mocks = vi.hoisted(() => ({
    getActiveServices: vi.fn(),
    getAvailableSlots: vi.fn(),
    createPublicAppointment: vi.fn(),
    notifyError: vi.fn(),
    notifySuccess: vi.fn(),
}));

vi.mock("../../../services/serviceApi", () => ({
    getActiveServices: mocks.getActiveServices,
}));

vi.mock("../../../services/appointmentsApi", () => ({
    getAvailableSlots: mocks.getAvailableSlots,
    createPublicAppointment: mocks.createPublicAppointment,
}));

vi.mock("../../../services/notifications", () => ({
    notifyError: mocks.notifyError,
    notifySuccess: mocks.notifySuccess,
}));

const service = {
    id: "11111111-1111-4111-8111-111111111111",
    name: "Corte clásico",
    description: "Corte de pelo",
    price: 15000,
    is_active: true,
    created_at: "",
    updated_at: "",
    duration_minutes: 45,
    buffer_minutes: 15,
};

const appointment = {
    id: "33333333-3333-4333-8333-333333333333",
    customer_id: "22222222-2222-4222-8222-222222222222",
    barber_id: null,
    service_id: service.id,
    appointment_date: "2030-07-01",
    start_time: "10:00",
    end_time: "11:00",
    status: "pending" as const,
    notes: null,
    created_at: "",
    updated_at: null,
    customer: {
        id: "22222222-2222-4222-8222-222222222222",
        full_name: "Juan Pérez",
        phone: "2915551234",
        email: null,
    },
    service,
};

async function completeBookingForm() {
    const user = userEvent.setup();

    await user.click(
        await screen.findByRole("radio", { name: /Corte clásico/ })
    );
    fireEvent.change(screen.getByLabelText("Fecha"), {
        target: { value: "2030-07-01" },
    });
    await user.click(
        await screen.findByRole("radio", { name: "10:00" })
    );
    await user.type(screen.getByLabelText("Nombre completo"), "Juan Pérez");
    await user.type(screen.getByLabelText("Teléfono"), "2915551234");

    return user;
}

describe("PublicBookingForm", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mocks.getActiveServices.mockResolvedValue([service]);
        mocks.getAvailableSlots.mockResolvedValue(["10:00", "10:15"]);
        mocks.createPublicAppointment.mockResolvedValue(appointment);
    });

    it("loads services, requests slots and submits a public booking", async () => {
        const onSuccess = vi.fn();
        render(<PublicBookingForm onSuccess={onSuccess} />);
        const user = await completeBookingForm();

        await user.click(screen.getByRole("button", { name: "Solicitar turno" }));

        await waitFor(() => {
            expect(mocks.getAvailableSlots).toHaveBeenCalledWith({
                serviceId: service.id,
                date: "2030-07-01",
            });
            expect(mocks.createPublicAppointment).toHaveBeenCalledWith(
                expect.objectContaining({
                    full_name: "Juan Pérez",
                    phone: "2915551234",
                    service_id: service.id,
                    start_time: "10:00",
                })
            );
            expect(mocks.notifySuccess).toHaveBeenCalledWith({
                title: "Reserva solicitada",
                description: "Tu turno quedó pendiente de confirmación.",
            });
            expect(onSuccess).toHaveBeenCalledWith(appointment);
        });
    });

    it("shows an empty state when there are no active services", async () => {
        mocks.getActiveServices.mockResolvedValue([]);
        render(<PublicBookingForm onSuccess={vi.fn()} />);

        expect(
            await screen.findByText("No hay servicios disponibles")
        ).toBeInTheDocument();
    });

    it("handles a 409 conflict and refreshes available slots", async () => {
        mocks.createPublicAppointment.mockRejectedValue({
            isAxiosError: true,
            response: { status: 409 },
        });
        mocks.getAvailableSlots
            .mockResolvedValueOnce(["10:00"])
            .mockResolvedValueOnce(["10:15"]);

        render(<PublicBookingForm onSuccess={vi.fn()} />);
        const user = await completeBookingForm();
        await user.click(screen.getByRole("button", { name: "Solicitar turno" }));

        await waitFor(() => {
            expect(mocks.notifyError).toHaveBeenCalledWith({
                title: "Horario no disponible",
                description: "El horario seleccionado ya no está disponible.",
            });
            expect(mocks.getAvailableSlots).toHaveBeenCalledTimes(2);
        });
    });
});
