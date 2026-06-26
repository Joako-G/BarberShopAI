import { customerRepository } from "../repositories";
import { Customer } from "../types";

export class ListCustomersUseCase {
  async execute(): Promise<Customer[]> {
    return customerRepository.findAll();
  }
}