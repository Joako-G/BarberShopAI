import { serviceRepository } from "../repositories";
import { UpdateServiceDto, Service } from "../types";
import { ConflictError, NotFoundError } from "../../../shared/errors";

export class UpdateServiceUseCase {
  async execute(id: string, dto: UpdateServiceDto): Promise<Service> {
    const existing = await serviceRepository.findById(id);
    if (!existing) {
      throw new NotFoundError("Service not found");
    }

    if (dto.name) {
      const all = await serviceRepository.findAll();
      const duplicate = all.find(
        (s) => s.id !== id && s.name.toLowerCase() === dto.name!.toLowerCase()
      );
      if (duplicate) {
        throw new ConflictError("A service with this name already exists");
      }
    }

    return serviceRepository.update(id, dto);
  }
}