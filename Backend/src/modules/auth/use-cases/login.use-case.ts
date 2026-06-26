import { supabase } from "../../../config/supabase";
import { profileRepository } from "../../profiles/repositories";
import { LoginDto, AuthResponse } from "../types";
import { UnauthorizedError } from "../../../shared/errors";

export class LoginUseCase {
  async execute(dto: LoginDto): Promise<AuthResponse> {
    const { data: signInData, error: signInError } =
      await supabase.auth.signInWithPassword({
        email: dto.email,
        password: dto.password,
      });

    if (signInError || !signInData.user) {
      throw new UnauthorizedError("Invalid credentials");
    }

    const profile = await profileRepository.findById(signInData.user.id);

    if (!profile) {
      throw new UnauthorizedError("User profile not found");
    }

    if (profile.role !== "admin") {
      throw new UnauthorizedError("Access denied. Admin role required.");
    }

    return {
      user: {
        id: signInData.user.id,
        email: signInData.user.email!,
      },
      profile: {
        id: profile.id,
        full_name: profile.full_name,
        phone: profile.phone ?? "",
        role: "admin",
        is_active: profile.is_active,
      },
      token: signInData.session?.access_token ?? "",
    };
  }
}