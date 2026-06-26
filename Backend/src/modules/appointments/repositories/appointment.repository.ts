import { supabaseAdmin } from "../../../config/supabase";
import {
  Appointment,
  AppointmentStatus,
  AppointmentWithDetails,
  ListAppointmentsQuery,
} from "../types";

const appointmentDetailsSelect = `
  *,
  customer:customers (
    id,
    full_name,
    phone,
    email
  ),
  service:services (
    id,
    name,
    description,
    duration_minutes,
    buffer_minutes,
    price,
    is_active
  )
`;

interface AtomicAppointmentResult {
  id: string;
}

const getAtomicAppointmentId = (data: unknown): string => {
  const result = Array.isArray(data) ? data[0] : data;

  if (
    typeof result !== "object" ||
    result === null ||
    !("id" in result) ||
    typeof (result as AtomicAppointmentResult).id !== "string"
  ) {
    throw new Error("Atomic appointment operation returned an invalid result");
  }

  return (result as AtomicAppointmentResult).id;
};

const findAppointmentWithDetailsById = async (
  id: string
): Promise<AppointmentWithDetails | null> => {
  const { data, error } = await supabaseAdmin
    .from("appointments")
    .select(appointmentDetailsSelect)
    .eq("id", id)
    .single();

  if (error) {
    if (error.code === "PGRST116") return null;
    throw error;
  }

  return data as AppointmentWithDetails;
};

export const appointmentRepository = {
  async findAll(filters: ListAppointmentsQuery): Promise<AppointmentWithDetails[]> {
    let customerIds: string[] | undefined;

    if (filters.customer) {
      const search = `%${filters.customer}%`;
      const [nameResult, phoneResult] = await Promise.all([
        supabaseAdmin.from("customers").select("id").ilike("full_name", search),
        supabaseAdmin.from("customers").select("id").ilike("phone", search),
      ]);

      if (nameResult.error) throw nameResult.error;
      if (phoneResult.error) throw phoneResult.error;

      customerIds = Array.from(
        new Set([
          ...(nameResult.data ?? []).map((customer) => customer.id),
          ...(phoneResult.data ?? []).map((customer) => customer.id),
        ])
      );

      if (customerIds.length === 0) {
        return [];
      }
    }

    let query = supabaseAdmin
      .from("appointments")
      .select(appointmentDetailsSelect)
      .order("appointment_date", { ascending: false })
      .order("start_time", { ascending: true });

    if (filters.date) {
      query = query.eq("appointment_date", filters.date);
    }

    if (filters.status) {
      query = query.eq("status", filters.status);
    }

    if (customerIds) {
      query = query.in("customer_id", customerIds);
    }

    const { data, error } = await query;

    if (error) throw error;
    return data as AppointmentWithDetails[];
  },

  async findById(id: string): Promise<AppointmentWithDetails | null> {
    return findAppointmentWithDetailsById(id);
  },

  async findOverlapping(
    appointmentDate: string,
    startTime: string,
    endTime: string,
    excludeId?: string
  ): Promise<Appointment[]> {
    let query = supabaseAdmin
      .from("appointments")
      .select("*")
      .eq("appointment_date", appointmentDate)
      .in("status", ["pending", "confirmed"])
      .lt("start_time", endTime)
      .gt("end_time", startTime);

    if (excludeId) {
      query = query.neq("id", excludeId);
    }

    const { data, error } = await query;

    if (error) throw error;
    return data;
  },

  async findByDate(date: string, excludeId?: string): Promise<Appointment[]> {
    let query = supabaseAdmin
      .from("appointments")
      .select("*")
      .eq("appointment_date", date)
      .in("status", ["pending", "confirmed"])
      .order("start_time");

    if (excludeId) {
      query = query.neq("id", excludeId);
    }

    const { data, error } = await query;

    if (error) throw error;
    return data;
  },

  async createWithCustomerAtomic(dto: {
    customer_id: string | null;
    full_name: string | null;
    phone: string | null;
    email: string | null;
    barber_id: string | null;
    service_id: string;
    appointment_date: string;
    start_time: string;
    status: AppointmentStatus;
    notes?: string | null;
  }): Promise<AppointmentWithDetails> {
    const { data, error } = await supabaseAdmin
      .rpc("create_appointment_with_customer_atomic", {
        p_customer_id: dto.customer_id,
        p_full_name: dto.full_name,
        p_phone: dto.phone,
        p_email: dto.email,
        p_barber_id: dto.barber_id,
        p_service_id: dto.service_id,
        p_appointment_date: dto.appointment_date,
        p_start_time: dto.start_time,
        p_status: dto.status,
        p_notes: dto.notes ?? null,
      });

    if (error) throw error;

    const appointment = await findAppointmentWithDetailsById(
      getAtomicAppointmentId(data)
    );

    if (!appointment) {
      throw new Error(
        "Atomic appointment and customer creation result was not found"
      );
    }

    return appointment;
  },

  async updateDetailsAtomic(
    id: string,
    dto: {
      service_id: string;
      appointment_date: string;
      start_time: string;
      notes: string | null;
    }
  ): Promise<AppointmentWithDetails> {
    const { data, error } = await supabaseAdmin
      .rpc("update_appointment_atomic", {
        p_appointment_id: id,
        p_service_id: dto.service_id,
        p_appointment_date: dto.appointment_date,
        p_start_time: dto.start_time,
        p_notes: dto.notes,
      });

    if (error) throw error;

    const appointment = await findAppointmentWithDetailsById(
      getAtomicAppointmentId(data)
    );

    if (!appointment) {
      throw new Error("Atomic appointment update result was not found");
    }

    return appointment;
  },

  async updateStatusAtomic(
    id: string,
    status: AppointmentStatus
  ): Promise<AppointmentWithDetails> {
    const { data, error } = await supabaseAdmin
      .rpc("transition_appointment_status_atomic", {
        p_appointment_id: id,
        p_next_status: status,
      });

    if (error) throw error;

    const appointment = await findAppointmentWithDetailsById(
      getAtomicAppointmentId(data)
    );

    if (!appointment) {
      throw new Error("Atomic appointment status result was not found");
    }

    return appointment;
  },
};
