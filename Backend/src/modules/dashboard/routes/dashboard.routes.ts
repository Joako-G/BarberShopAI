import { Router } from "express";
import { dashboardController } from "../controllers";
import { authenticate } from "../../../middlewares/auth.middleware";
import { requireRole } from "../../../middlewares/require-role.middleware";

const router = Router();

router.get("/stats", authenticate, requireRole("admin"), dashboardController.getStats);

export default router;
