import { Router } from "express";
import { customerController } from "../controllers";
import { authenticate } from "../../../middlewares/auth.middleware";
import { requireRole } from "../../../middlewares/require-role.middleware";

const router = Router();

router.get("/", authenticate, requireRole("admin"), customerController.getAll);
router.get("/:id", authenticate, requireRole("admin"), customerController.getById);
router.post("/", authenticate, requireRole("admin"), customerController.create);
router.put("/:id", authenticate, requireRole("admin"), customerController.update);

export default router;