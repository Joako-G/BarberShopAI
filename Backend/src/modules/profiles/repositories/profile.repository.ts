import { supabaseAdmin } from "../../../config/supabase";
import { Profile } from "../types";

export const profileRepository = {
  async findAll(): Promise<Profile[]> {
    const { data, error } = await supabaseAdmin
      .from("profiles")
      .select("*")
      .order("full_name");

    if (error) throw error;
    return data;
  },

  async findById(id: string): Promise<Profile | null> {
    const { data, error } = await supabaseAdmin
      .from("profiles")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      if (error.code === "PGRST116") return null;
      throw error;
    }
    return data;
  },

  async insert(dto: {
    id: string;
    full_name: string;
    phone: string | null | undefined;
    role: string;
    is_active: boolean;
  }): Promise<Profile> {
    const { data, error } = await supabaseAdmin
      .from("profiles")
      .insert({ ...dto, updated_at: new Date().toISOString() })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async update(
    id: string,
    dto: Partial<{
      full_name: string;
      phone: string | null;
      role: string;
      is_active: boolean;
    }>
  ): Promise<Profile> {
    const { data, error } = await supabaseAdmin
      .from("profiles")
      .update({ ...dto, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async remove(id: string): Promise<void> {
    const { error } = await supabaseAdmin
      .from("profiles")
      .delete()
      .eq("id", id);

    if (error) throw error;
  },
};
