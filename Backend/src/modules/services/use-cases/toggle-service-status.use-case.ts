import { serviceRepository } from "../repositories";
import { NotFoundError } from "../../../shared/errors";

export class ToggleServiceStatusUseCase {
  async execute(id: string, is_active: boolean) {
    const existing = await serviceRepository.findById(id);
    if (!existing) {
      throw new NotFoundError("Service not found");
    }

    return serviceRepository.update(id, { is_active });
  }
}
