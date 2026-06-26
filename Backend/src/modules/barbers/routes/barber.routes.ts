import { Router } from "express";
import { barberController } from "../controllers";
import { authenticate } from "../../../middlewares/auth.middleware";
import { requireRole } from "../../../middlewares/require-role.middleware";

const router = Router();

router.post(
  "/",
  authenticate,
  requireRole("admin"),
  barberController.create
);

export default router;