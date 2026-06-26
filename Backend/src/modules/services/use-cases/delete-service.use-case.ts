import { serviceRepository } from "../repositories";
import { NotFoundError } from "../../../shared/errors";

export class DeleteServiceUseCase {
  async execute(id: string): Promise<void> {
    const existing = await serviceRepository.findById(id);
    if (!existing) {
      throw new NotFoundError("Service not found");
    }

    await serviceRepository.remove(id);
  }
}