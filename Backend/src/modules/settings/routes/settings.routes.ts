import { Router } from "express";
import { authenticate } from "../../../middlewares/auth.middleware";
import { requireRole } from "../../../middlewares/require-role.middleware";
import { settingsController } from "../controllers";

const router = Router();

router.get(
  "/general",
  authenticate,
  requireRole("admin"),
  settingsController.getGeneral
);

router.put(
  "/general",
  authenticate,
  requireRole("admin"),
  settingsController.updateGeneral
);

router.get(
  "/business-hours",
  authenticate,
  requireRole("admin"),
  settingsController.getBusinessHours
);

router.put(
  "/business-hours",
  authenticate,
  requireRole("admin"),
  settingsController.updateBusinessHours
);

router.get(
  "/appointments",
  authenticate,
  requireRole("admin"),
  settingsController.getAppointmentSettings
);

router.put(
  "/appointments",
  authenticate,
  requireRole("admin"),
  settingsController.updateAppointmentSettings
);

router.get(
  "/appearance",
  authenticate,
  requireRole("admin"),
  settingsController.getAppearanceSettings
);

router.put(
  "/appearance",
  authenticate,
  requireRole("admin"),
  settingsController.updateAppearanceSettings
);

router.get(
  "/calendar",
  authenticate,
  requireRole("admin"),
  settingsController.listCalendarExceptions
);

router.post(
  "/calendar",
  authenticate,
  requireRole("admin"),
  settingsController.createCalendarException
);

router.put(
  "/calendar/:id",
  authenticate,
  requireRole("admin"),
  settingsController.updateCalendarException
);

router.delete(
  "/calendar/:id",
  authenticate,
  requireRole("admin"),
  settingsController.deleteCalendarException
);

export default router;
