import { Router } from "express";
import healthRoutes from "./health.routes";
import {
  profileRoutes,
  serviceRoutes,
  authRoutes,
  customerRoutes,
  appointmentRoutes,
  dashboardRoutes,
  settingsRoutes,
} from "../modules";
import { appointmentController } from "../modules/appointments";

const router = Router();

router.use("/api/health", healthRoutes);
router.use("/api/auth", authRoutes);
router.use("/api/profiles", profileRoutes);
router.use("/api/services", serviceRoutes);
router.use("/api/customers", customerRoutes);
router.get("/api/available-slots", appointmentController.getAvailableSlots);
router.use("/api/appointments", appointmentRoutes);
router.use("/api/dashboard", dashboardRoutes);
router.use("/api/settings", settingsRoutes);

export default router;
