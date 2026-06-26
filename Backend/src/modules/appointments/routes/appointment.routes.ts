import { Router } from "express";
import { appointmentController } from "../controllers";
import { authenticate } from "../../../middlewares/auth.middleware";
import { requireRole } from "../../../middlewares/require-role.middleware";
import { publicBookingRateLimiter } from "../../../middlewares";

const router = Router();

router.post(
  "/public",
  publicBookingRateLimiter,
  appointmentController.createPublic
);
router.get("/available-slots", appointmentController.getAvailableSlots);

router.post("/", authenticate, requireRole("admin"), appointmentController.createAdmin);
router.get("/", authenticate, requireRole("admin"), appointmentController.getAll);
router.get("/:id", authenticate, requireRole("admin"), appointmentController.getById);
router.put("/:id", authenticate, requireRole("admin"), appointmentController.update);
router.patch("/:id/confirm", authenticate, requireRole("admin"), appointmentController.confirm);
router.patch("/:id/cancel", authenticate, requireRole("admin"), appointmentController.cancel);
router.patch("/:id/complete", authenticate, requireRole("admin"), appointmentController.complete);
router.patch("/:id/no-show", authenticate, requireRole("admin"), appointmentController.noShow);

export default router;
