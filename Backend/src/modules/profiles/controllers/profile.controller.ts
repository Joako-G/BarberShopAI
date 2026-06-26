import { Request, Response, NextFunction } from "express";
import {
  CreateProfileUseCase,
  UpdateProfileUseCase,
  GetProfileByIdUseCase,
  GetProfilesUseCase,
  DeleteProfileUseCase,
} from "../use-cases";
import {
  createProfileSchema,
  updateProfileSchema,
  profileIdSchema,
} from "../types";
import { success, created } from "../../../shared/utils";

const createProfileUseCase = new CreateProfileUseCase();
const updateProfileUseCase = new UpdateProfileUseCase();
const getProfileByIdUseCase = new GetProfileByIdUseCase();
const getProfilesUseCase = new GetProfilesUseCase();
const deleteProfileUseCase = new DeleteProfileUseCase();

export const profileController = {
  async getAll(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const profiles = await getProfilesUseCase.execute();
      res.json(success(profiles));
    } catch (err) {
      next(err);
    }
  },

  async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = profileIdSchema.parse(req.params);
      const profile = await getProfileByIdUseCase.execute(id);
      res.json(success(profile));
    } catch (err) {
      next(err);
    }
  },

  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const dto = createProfileSchema.parse(req.body);
      const profile = await createProfileUseCase.execute(dto);
      res.status(201).json(created(profile));
    } catch (err) {
      next(err);
    }
  },

  async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = profileIdSchema.parse(req.params);
      const dto = updateProfileSchema.parse(req.body);
      const profile = await updateProfileUseCase.execute(id, dto);
      res.json(success(profile));
    } catch (err) {
      next(err);
    }
  },

  async remove(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = profileIdSchema.parse(req.params);
      await deleteProfileUseCase.execute(id);
      res.status(204).send();
    } catch (err) {
      next(err);
    }
  },
};