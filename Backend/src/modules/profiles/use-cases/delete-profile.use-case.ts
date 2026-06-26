import { profileRepository } from "../repositories";
import { NotFoundError } from "../../../shared/errors";

export class DeleteProfileUseCase {
  async execute(id: string): Promise<void> {
    const existing = await profileRepository.findById(id);
    if (!existing) {
      throw new NotFoundError("Profile not found");
    }

    await profileRepository.remove(id);
  }
}