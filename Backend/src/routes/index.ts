import { Router } from "express";
import healthRoutes from "./health.routes";
import {
  profileRoutes,
  serviceRoutes,
  authRoutes,
  barberRoutes,
  customerRoutes,
  appointmentRoutes,
  dashboardRoutes,
} from "../modules";
import { appointmentController } from "../modules/appointments";

const router = Router();

router.use("/api/health", healthRoutes);
router.use("/api/auth", authRoutes);
router.use("/api/profiles", profileRoutes);
router.use("/api/services", serviceRoutes);
router.use("/api/barbers", barberRoutes);
router.use("/api/customers", customerRoutes);
router.get("/api/available-slots", appointmentController.getAvailableSlots);
router.use("/api/appointments", appointmentRoutes);
router.use("/api/dashboard", dashboardRoutes);

export default router;
