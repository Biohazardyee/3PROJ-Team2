import express, { Request, Response, NextFunction, Router } from "express";
import userController from "../../modules/db/users/user.controller.js";
import { authGuard } from "../../middlewares/auth.js";
import { checkAdmin } from "../../middlewares/checkAdmin.js";
import { checkResourceOwnerOrAdmin } from "../../middlewares/checkResourceOwnerOrAdmin.js";

var router: Router = express.Router();

router.patch(
  "/profile",
  authGuard,
  function (req: Request, res: Response, next: NextFunction): void {
    userController.updateProfile(req, res, next);
  },
);

router.post(
  "/signin",
  function (req: Request, res: Response, next: NextFunction): void {
    userController.add(req, res, next);
  },
);

router.post(
  "/login",
  function (req: Request, res: Response, next: NextFunction): void {
    userController.login(req, res, next);
  },
);


router.post(
  "/update-push-token",
  authGuard,
  function (req: Request, res: Response, next: NextFunction): void {
    userController.updatePushToken(req, res, next);
  },
);

router.get(
  "/public/:id",
  authGuard,
  function (req: Request, res: Response, next: NextFunction): void {
    userController.getPublicProfile(req, res, next);
  },
);

router.put(
  "/:id",
  authGuard,
  checkResourceOwnerOrAdmin("users"),
  function (req: Request, res: Response, next: NextFunction): void {
    userController.update(req, res, next);
  },
);

router.delete(
  "/:id",
  authGuard,
  checkResourceOwnerOrAdmin("users"),
  function (req: Request, res: Response, next: NextFunction): void {
    userController.delete(req, res, next);
  },
);

router.get(
  "/",
  authGuard,
  checkAdmin,
  function (req: Request, res: Response, next: NextFunction): void {
    userController.getAll(req, res, next);
  },
);

router.get(
  "/fields",
  authGuard,
  checkAdmin,
  function (req: Request, res: Response, next: NextFunction): void {
    userController.getAllWithFields(req, res, next);
  },
);

router.get(
  "/:id",
  authGuard,
  checkResourceOwnerOrAdmin("users"),
  function (req: Request, res: Response, next: NextFunction): void {
    userController.getById(req, res, next);
  },
);

router.get(
  "/:id/fields",
  authGuard,
  checkResourceOwnerOrAdmin("users"),
  function (req: Request, res: Response, next: NextFunction): void {
    userController.getByIdWithFields(req, res, next);
  },
);

export default router;
