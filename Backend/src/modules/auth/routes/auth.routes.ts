import { Router } from "express";
import { authController } from "../controllers";
import { loginRateLimiter } from "../../../middlewares";

const router = Router();

router.post("/login", loginRateLimiter, authController.login);

export default router;
