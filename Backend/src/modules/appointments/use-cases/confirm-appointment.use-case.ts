import { AppointmentWithDetails } from "../types";
import { TransitionAppointmentStatusUseCase } from "./transition-appointment-status.use-case";

const transitionAppointmentStatusUseCase =
  new TransitionAppointmentStatusUseCase();

export class ConfirmAppointmentUseCase {
  async execute(id: string): Promise<AppointmentWithDetails> {
    return transitionAppointmentStatusUseCase.execute(id, "confirmed");
  }
}
