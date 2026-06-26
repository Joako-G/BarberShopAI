import { Request, Response, NextFunction } from "express";
import { UserRole } from "../shared/types";
import { AppError } from "../shared/errors";
import { supabase } from "../config/supabase";
import { profileRepository } from "../modules/profiles/repositories";

export interface AuthenticatedRequest extends Request {
  userId?: string;
  userRole?: UserRole;
}

export function authenticate(
  req: AuthenticatedRequest,
  _res: Response,
  next: NextFunction
): void {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    next(new AppError("Missing or invalid authorization header", 401));
    return;
  }

  const token = authHeader.split(" ")[1];

  supabase.auth
    .getUser(token)
    .then((result) => {
      const { data, error } = result;
      if (error || !data?.user) {
        next(new AppError("Invalid or expired token", 401));
        return;
      }

      req.userId = data.user.id;

      return profileRepository.findById(data.user.id);
    })
    .then((profile) => {
      if (profile === undefined) return;

      if (!profile) {
        next(new AppError("User profile not found", 401));
        return;
      }

      req.userRole = profile.role as UserRole;
      next();
    })
    .catch((err: Error) => {
      next(new AppError("Authentication failed", 401, err.message));
    });
}
