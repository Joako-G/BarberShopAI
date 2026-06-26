import { beforeEach, describe, expect, it, vi } from "vitest";
import { appointmentRepository } from "../repositories";
import { serviceRepository } from "../../services/repositories";
import { CreateAdminAppointmentUseCase } from "../use-cases/create-admin-appointment.use-case";
import { CreatePublicAppointmentUseCase } from "../use-cases/create-public-appointment.use-case";

const service = {
  id: "11111111-1111-4111-8111-111111111111",
  name: "Corte",
  description: null,
  duration_minutes: 45,
  buffer_minutes: 15,
  price: 15000,
  is_active: true,
  created_at: "",
};

const customer = {
  id: "22222222-2222-4222-8222-222222222222",
  full_name: "Juan Pérez",
  phone: "2915551234",
  email: null,
  created_at: "",
  updated_at: null,
};

const insertedAppointment = {
  id: "33333333-3333-4333-8333-333333333333",
  customer_id: customer.id,
  barber_id: null,
  service_id: service.id,
  appointment_date: "2030-07-01",
  start_time: "10:00",
  end_time: "11:00",
  status: "pending" as const,
  notes: null,
  created_at: "",
  updated_at: null,
  customer,
  service,
};

describe("appointment creation", () => {
  beforeEach(() => {
    vi.spyOn(serviceRepository, "findById").mockResolvedValue(service);
    vi.spyOn(appointmentRepository, "findOverlapping").mockResolvedValue([]);
    vi.spyOn(
      appointmentRepository,
      "createWithCustomerAtomic"
    ).mockResolvedValue(insertedAppointment);
  });

  it("delegates public customer reuse and creation to the atomic RPC", async () => {
    await new CreatePublicAppointmentUseCase().execute({
      full_name: customer.full_name,
      phone: customer.phone,
      email: null,
      service_id: service.id,
      appointment_date: "2030-07-01",
      start_time: "10:00",
      notes: null,
    });

    expect(
      appointmentRepository.createWithCustomerAtomic
    ).toHaveBeenCalledWith(
      expect.objectContaining({
        customer_id: null,
        full_name: customer.full_name,
        phone: customer.phone,
        status: "pending",
      })
    );
  });

  it("creates admin appointments as confirmed for a new customer", async () => {
    await new CreateAdminAppointmentUseCase().execute({
      customer_mode: "new",
      full_name: customer.full_name,
      phone: customer.phone,
      email: null,
      service_id: service.id,
      appointment_date: "2030-07-01",
      start_time: "10:00",
      notes: null,
    });

    expect(
      appointmentRepository.createWithCustomerAtomic
    ).toHaveBeenCalledWith(
      expect.objectContaining({
        customer_id: null,
        full_name: customer.full_name,
        phone: customer.phone,
        status: "confirmed",
      })
    );
  });

  it("passes an existing customer id without customer data", async () => {
    await new CreateAdminAppointmentUseCase().execute({
      customer_mode: "existing",
      customer_id: customer.id,
      service_id: service.id,
      appointment_date: "2030-07-01",
      start_time: "10:00",
      notes: null,
    });

    expect(
      appointmentRepository.createWithCustomerAtomic
    ).toHaveBeenCalledWith(
      expect.objectContaining({
        customer_id: customer.id,
        full_name: null,
        phone: null,
        email: null,
        status: "confirmed",
      })
    );
  });

  it("returns 409 when the atomic insert detects a concurrent conflict", async () => {
    vi.mocked(
      appointmentRepository.createWithCustomerAtomic
    ).mockRejectedValue({
        code: "P0001",
        message: "APPOINTMENT_CONFLICT",
      });

    await expect(
      new CreatePublicAppointmentUseCase().execute({
        full_name: customer.full_name,
        phone: customer.phone,
        email: null,
        service_id: service.id,
        appointment_date: "2030-07-01",
        start_time: "10:00",
        notes: null,
      })
    ).rejects.toMatchObject({
      statusCode: 409,
      message: "El horario seleccionado ya no está disponible.",
    });
  });
});
