import { profileRepository } from "../repositories";
import { Profile } from "../types";
import { NotFoundError } from "../../../shared/errors";

export class GetProfileByIdUseCase {
  async execute(id: string): Promise<Profile> {
    const profile = await profileRepository.findById(id);
    if (!profile) {
      throw new NotFoundError("Profile not found");
    }
    return profile;
  }
}