import { serviceRepository } from "../repositories";
import { Service } from "../types";

export class GetAdminServicesUseCase {
  async execute(): Promise<Service[]> {
    return serviceRepository.findAll();
  }
}
