import { serviceRepository } from "../repositories";
import { Service } from "../types";
import { NotFoundError } from "../../../shared/errors";

export class GetServiceByIdUseCase {
  async execute(id: string): Promise<Service> {
    const service = await serviceRepository.findById(id);
    if (!service) {
      throw new NotFoundError("Service not found");
    }
    return service;
  }
}