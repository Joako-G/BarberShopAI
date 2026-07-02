import { supabaseAdmin } from "../../../config/supabase";
import {
  AppointmentSettings,
  BusinessHour,
  BusinessHourDto,
  BusinessSettings,
  UpdateAppointmentSettingsDto,
  UpdateGeneralSettingsDto,
} from "../types";

const DEFAULT_SETTINGS: Omit<UpdateGeneralSettingsDto, "email"> & {
  email: string | null;
} = {
  system_name: "Sistema de Turnos",
  business_name: "Mi Negocio",
  business_type: "Barbería",
  description: "Sistema para gestionar turnos, clientes y servicios.",
  phone: null,
  whatsapp: null,
  email: null,
  address: null,
};

export const settingsRepository = {
  async findGeneral(): Promise<BusinessSettings | null> {
    const { data, error } = await supabaseAdmin
      .from("business_settings")
      .select("*")
      .limit(1)
      .maybeSingle();

    if (error) throw error;
    return data;
  },

  async createDefault(): Promise<BusinessSettings> {
    const { data, error } = await supabaseAdmin
      .from("business_settings")
      .insert(DEFAULT_SETTINGS)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async updateGeneral(
    id: string,
    dto: UpdateGeneralSettingsDto
  ): Promise<BusinessSettings> {
    const { data, error } = await supabaseAdmin
      .from("business_settings")
      .update({
        ...dto,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async findBusinessHours(): Promise<BusinessHour[]> {
    const { data, error } = await supabaseAdmin
      .from("business_hours")
      .select("*")
      .order("day_of_week", { ascending: true });

    if (error) throw error;
    return (data ?? []).map(normalizeBusinessHour);
  },

  async upsertBusinessHours(hours: BusinessHourDto[]): Promise<BusinessHour[]> {
    const records = hours.map((hour) => ({
      day_of_week: hour.day_of_week,
      is_open: hour.is_open,
      start_time: hour.is_open ? hour.start_time : null,
      end_time: hour.is_open ? hour.end_time : null,
      updated_at: new Date().toISOString(),
    }));

    const { data, error } = await supabaseAdmin
      .from("business_hours")
      .upsert(records, { onConflict: "day_of_week" })
      .select("*")
      .order("day_of_week", { ascending: true });

    if (error) throw error;
    return (data ?? []).map(normalizeBusinessHour);
  },

  async findAppointmentSettings(): Promise<AppointmentSettings | null> {
    const { data, error } = await supabaseAdmin
      .from("appointment_settings")
      .select("*")
      .limit(1)
      .maybeSingle();

    if (error) throw error;
    return data;
  },

  async createDefaultAppointmentSettings(
    settings: UpdateAppointmentSettingsDto
  ): Promise<AppointmentSettings> {
    const { data, error } = await supabaseAdmin
      .from("appointment_settings")
      .insert(settings)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async updateAppointmentSettings(
    id: string,
    dto: UpdateAppointmentSettingsDto
  ): Promise<AppointmentSettings> {
    const { data, error } = await supabaseAdmin
      .from("appointment_settings")
      .update({
        ...dto,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },
};

function normalizeBusinessHour(hour: BusinessHour): BusinessHour {
  return {
    ...hour,
    start_time: normalizeTime(hour.start_time),
    end_time: normalizeTime(hour.end_time),
  };
}

function normalizeTime(value: string | null): string | null {
  return value ? value.slice(0, 5) : null;
}
