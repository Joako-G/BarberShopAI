import { Response, NextFunction } from "express";
import { AuthenticatedRequest } from "./auth.middleware";
import { UserRole } from "../shared/types";
import { AppError } from "../shared/errors";

export function requireRole(...roles: UserRole[]) {
  return (req: AuthenticatedRequest, _res: Response, next: NextFunction): void => {
    if (!req.userRole) {
      next(new AppError("Authentication required", 401));
      return;
    }

    if (!roles.includes(req.userRole)) {
      next(new AppError("Insufficient permissions", 403));
      return;
    }

    next();
  };
}