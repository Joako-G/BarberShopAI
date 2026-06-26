import { supabaseAdmin } from "../../../config/supabase";
import { Customer } from "../types";

export const customerRepository = {
  async findAll(): Promise<Customer[]> {
    const { data, error } = await supabaseAdmin
      .from("customers")
      .select("*")
      .order("full_name");

    if (error) throw error;
    return data;
  },

  async findById(id: string): Promise<Customer | null> {
    const { data, error } = await supabaseAdmin
      .from("customers")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      if (error.code === "PGRST116") return null;
      throw error;
    }
    return data;
  },

  async findByPhone(phone: string): Promise<Customer | null> {
    const { data, error } = await supabaseAdmin
      .from("customers")
      .select("*")
      .eq("phone", phone)
      .single();

    if (error) {
      if (error.code === "PGRST116") return null;
      throw error;
    }
    return data;
  },

  async insert(dto: {
    full_name: string;
    phone: string;
    email?: string | null;
  }): Promise<Customer> {
    const { data, error } = await supabaseAdmin
      .from("customers")
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
      phone: string;
      email: string | null;
    }>
  ): Promise<Customer> {
    const { data, error } = await supabaseAdmin
      .from("customers")
      .update({ ...dto, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async remove(id: string): Promise<void> {
    const { error } = await supabaseAdmin.from("customers").delete().eq("id", id);

    if (error) throw error;
  },
};
