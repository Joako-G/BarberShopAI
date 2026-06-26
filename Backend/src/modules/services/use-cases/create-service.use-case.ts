import { serviceRepository } from "../repositories";
import { CreateServiceDto, Service } from "../types";
import { ConflictError } from "../../../shared/errors";

export class CreateServiceUseCase {
  async execute(dto: CreateServiceDto): Promise<Service> {
    const existing = await serviceRepository.findAll();
    const duplicate = existing.find(
      (s) => s.name.toLowerCase() === dto.name.toLowerCase()
    );
    if (duplicate) {
      throw new ConflictError("A service with this name already exists");
    }

    return serviceRepository.insert({
      name: dto.name,
      description: dto.description ?? null,
      duration_minutes: dto.duration_minutes,
      price: dto.price,
    });
  }
}