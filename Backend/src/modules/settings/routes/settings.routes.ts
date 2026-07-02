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

export default router;
