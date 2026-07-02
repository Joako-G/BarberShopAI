import { supabaseAdmin } from "../../../config/supabase";
import { Service } from "../types";

export const serviceRepository = {
  async findAll(): Promise<Service[]> {
    const { data, error } = await supabaseAdmin
      .from("services")
      .select("*")
      .order("name");

    if (error) throw error;
    return data;
  },

  async findAllActive(): Promise<Service[]> {
    const { data, error } = await supabaseAdmin
      .from("services")
      .select("*")
      .eq("is_active", true)
      .order("name");

    if (error) throw error;
    return data;
  },

  async findById(id: string): Promise<Service | null> {
    const { data, error } = await supabaseAdmin
      .from("services")
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
    name: string;
    description: string | null | undefined;
    duration_minutes: number;
    price: number;
    buffer_minutes?: number;
    is_active?: boolean;
  }): Promise<Service> {
    const { data, error } = await supabaseAdmin
      .from("services")
      .insert(dto)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async update(
    id: string,
    dto: Partial<{
      name: string;
      description: string | null;
      duration_minutes: number;
      buffer_minutes: number;
      price: number;
      is_active: boolean;
    }>
  ): Promise<Service> {
    const { data, error } = await supabaseAdmin
      .from("services")
      .update(dto)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

};
