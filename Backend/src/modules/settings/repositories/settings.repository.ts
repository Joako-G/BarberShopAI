import { supabaseAdmin } from "../../../config/supabase";
import { BusinessSettings, UpdateGeneralSettingsDto } from "../types";

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
};

