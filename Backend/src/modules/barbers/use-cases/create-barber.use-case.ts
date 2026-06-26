import { supabaseAdmin } from "../../../config/supabase";
import { profileRepository } from "../../profiles/repositories";
import { CreateBarberDto, BarberResponse } from "../types";
import { ConflictError } from "../../../shared/errors";

export class CreateBarberUseCase {
  async execute(dto: CreateBarberDto): Promise<BarberResponse> {
    const { data: existingAuth } = await supabaseAdmin.auth.admin.listUsers();

    const emailExists = existingAuth?.users.some(
      (u) => u.email === dto.email.toLowerCase()
    );

    if (emailExists) {
      throw new ConflictError("A user with this email already exists");
    }

    const { data: authData, error: authError } =
      await supabaseAdmin.auth.admin.createUser({
        email: dto.email.toLowerCase(),
        password: dto.password,
        email_confirm: true,
      });

    if (authError || !authData.user) {
      throw new ConflictError(
        authError?.message ?? "Failed to create barber account"
      );
    }

    const profile = await profileRepository.insert({
      id: authData.user.id,
      full_name: dto.full_name,
      phone: dto.phone ?? null,
      role: "barber",
      is_active: true,
    });

    return {
      user: {
        id: authData.user.id,
        email: authData.user.email!,
      },
      profile: {
        id: profile.id,
        full_name: profile.full_name,
        role: "barber",
        is_active: true,
      },
    };
  }
}