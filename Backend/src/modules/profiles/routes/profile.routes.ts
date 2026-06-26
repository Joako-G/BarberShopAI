import { Router } from "express";
import { profileController } from "../controllers";
import { authenticate } from "../../../middlewares/auth.middleware";
import { requireRole } from "../../../middlewares/require-role.middleware";

const router = Router();

router.get("/", authenticate, requireRole("admin"), profileController.getAll);
router.get(
  "/:id",
  authenticate,
  requireRole("admin"),
  profileController.getById
);
router.post("/", authenticate, requireRole("admin"), profileController.create);
router.put("/:id", authenticate, requireRole("admin"), profileController.update);
router.delete("/:id", authenticate, requireRole("admin"), profileController.remove);

export default router;
