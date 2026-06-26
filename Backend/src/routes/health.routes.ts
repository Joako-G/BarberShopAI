import { Router, Request, Response } from "express";
import { success } from "../shared/utils";

const router = Router();

router.get("/", (_req: Request, res: Response) => {
  res.json(
    success({
      status: "healthy",
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    })
  );
});

export default router;