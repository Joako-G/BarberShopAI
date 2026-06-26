import { Router } from "express";
import { serviceController } from "../controllers";
import { authenticate } from "../../../middlewares/auth.middleware";
import { requireRole } from "../../../middlewares/require-role.middleware";

const router = Router();

router.get("/", serviceController.getAll);
router.get(
  "/admin",
  authenticate,
  requireRole("admin"),
  serviceController.getAllAdmin
);
router.get("/:id", serviceController.getById);
router.post("/", authenticate, requireRole("admin"), serviceController.create);
router.put("/:id", authenticate, requireRole("admin"), serviceController.update);
router.patch("/:id/status", authenticate, requireRole("admin"), serviceController.toggleStatus);
router.delete("/:id", authenticate, requireRole("admin"), serviceController.remove);

export default router;
