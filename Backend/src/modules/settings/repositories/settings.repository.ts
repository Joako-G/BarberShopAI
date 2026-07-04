import { supabaseAdmin } from "../../../config/supabase";
import {
  AppearanceSettings,
  AppointmentSettings,
  BusinessHour,
  BusinessHourDto,
  BusinessSettings,
  CalendarException,
  CalendarExceptionDto,
  UpdateAppearanceSettingsDto,
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

  async findAppearanceSettings(): Promise<AppearanceSettings | null> {
    const { data, error } = await supabaseAdmin
      .from("appearance_settings")
      .select("*")
      .limit(1)
      .maybeSingle();

    if (error) throw error;
    return data;
  },

  async createDefaultAppearanceSettings(
    settings: UpdateAppearanceSettingsDto
  ): Promise<AppearanceSettings> {
    const { data, error } = await supabaseAdmin
      .from("appearance_settings")
      .insert(settings)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async updateAppearanceSettings(
    id: string,
    dto: UpdateAppearanceSettingsDto
  ): Promise<AppearanceSettings> {
    const { data, error } = await supabaseAdmin
      .from("appearance_settings")
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

  async findCalendarExceptions(): Promise<CalendarException[]> {
    const { data, error } = await supabaseAdmin
      .from("calendar_exceptions")
      .select("*")
      .order("start_date", { ascending: true })
      .order("created_at", { ascending: true });

    if (error) throw error;
    return (data ?? []).map(normalizeCalendarException);
  },

  async findCalendarExceptionById(id: string): Promise<CalendarException | null> {
    const { data, error } = await supabaseAdmin
      .from("calendar_exceptions")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (error) throw error;
    return data ? normalizeCalendarException(data) : null;
  },

  async findCalendarExceptionsForDate(date: string): Promise<CalendarException[]> {
    const { data, error } = await supabaseAdmin
      .from("calendar_exceptions")
      .select("*")
      .lte("start_date", date)
      .gte("end_date", date)
      .order("created_at", { ascending: true });

    if (error) throw error;
    return (data ?? []).map(normalizeCalendarException);
  },

  async createCalendarException(
    dto: CalendarExceptionDto
  ): Promise<CalendarException> {
    const { data, error } = await supabaseAdmin
      .from("calendar_exceptions")
      .insert(toCalendarExceptionRecord(dto))
      .select()
      .single();

    if (error) throw error;
    return normalizeCalendarException(data);
  },

  async updateCalendarException(
    id: string,
    dto: CalendarExceptionDto
  ): Promise<CalendarException | null> {
    const { data, error } = await supabaseAdmin
      .from("calendar_exceptions")
      .update({
        ...toCalendarExceptionRecord(dto),
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .maybeSingle();

    if (error) throw error;
    return data ? normalizeCalendarException(data) : null;
  },

  async deleteCalendarException(id: string): Promise<boolean> {
    const { error, count } = await supabaseAdmin
      .from("calendar_exceptions")
      .delete({ count: "exact" })
      .eq("id", id);

    if (error) throw error;
    return (count ?? 0) > 0;
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

function toCalendarExceptionRecord(dto: CalendarExceptionDto) {
  const isSpecialHours = dto.type === "SPECIAL_HOURS";

  return {
    type: dto.type,
    title: dto.title,
    start_date: dto.start_date,
    end_date: dto.end_date,
    is_closed: !isSpecialHours,
    special_start_time: isSpecialHours ? dto.special_start_time : null,
    special_end_time: isSpecialHours ? dto.special_end_time : null,
    notes: dto.notes ?? null,
  };
}

function normalizeCalendarException(
  exception: CalendarException
): CalendarException {
  return {
    ...exception,
    special_start_time: normalizeTime(exception.special_start_time),
    special_end_time: normalizeTime(exception.special_end_time),
  };
}
