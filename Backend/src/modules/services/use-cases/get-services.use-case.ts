import { serviceRepository } from "../repositories";
import { Service } from "../types";

export class GetServicesUseCase {
  async execute(): Promise<Service[]> {
    return serviceRepository.findAllActive();
  }
}
