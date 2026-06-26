import { profileRepository } from "../repositories";
import { CreateProfileDto, Profile } from "../types";
import { ConflictError, NotFoundError } from "../../../shared/errors";

export class CreateProfileUseCase {
  async execute(dto: CreateProfileDto): Promise<Profile> {
    const all = await profileRepository.findAll();
    const duplicate = all.find(
      (p) => dto.phone && p.phone === dto.phone
    );
    if (duplicate) {
      throw new ConflictError("A profile with this phone already exists");
    }

    return profileRepository.insert({
      id: dto.id,
      full_name: dto.full_name,
      phone: dto.phone ?? null,
      role: dto.role,
      is_active: dto.is_active,
    });
  }
}