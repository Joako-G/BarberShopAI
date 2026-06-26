import { profileRepository } from "../repositories";
import { UpdateProfileDto, Profile } from "../types";
import { ConflictError, NotFoundError } from "../../../shared/errors";

export class UpdateProfileUseCase {
  async execute(id: string, dto: UpdateProfileDto): Promise<Profile> {
    const existing = await profileRepository.findById(id);
    if (!existing) {
      throw new NotFoundError("Profile not found");
    }

    if (dto.phone) {
      const all = await profileRepository.findAll();
      const duplicate = all.find(
        (p) => p.id !== id && p.phone === dto.phone
      );
      if (duplicate) {
        throw new ConflictError("A profile with this phone already exists");
      }
    }

    return profileRepository.update(id, dto);
  }
}