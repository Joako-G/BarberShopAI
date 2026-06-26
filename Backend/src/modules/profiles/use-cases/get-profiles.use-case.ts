import { profileRepository } from "../repositories";
import { Profile } from "../types";

export class GetProfilesUseCase {
  async execute(): Promise<Profile[]> {
    return profileRepository.findAll();
  }
}