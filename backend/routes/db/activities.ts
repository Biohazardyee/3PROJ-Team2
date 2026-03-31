import { Router, NextFunction, Request, Response } from "express";
import activityController from "../../modules/db/activities/activity.controller.js";
import { authGuard } from "../../middlewares/auth.js";
import { checkAdmin } from "../../middlewares/checkAdmin.js";
import { checkResourceOwnerOrAdmin } from "../../middlewares/checkResourceOwnerOrAdmin.js";
import { checkAdminOrSelf } from "../../middlewares/checkAdminOrSelf";

const router: Router = Router();

router.post(
  "/",
  authGuard,
  function (req: Request, res: Response, next: NextFunction): void {
    activityController.add(req, res, next);
  },
);

router.get(
  "/",
  authGuard,
  checkAdmin,
  function (req: Request, res: Response, next: NextFunction): void {
    activityController.getAll(req, res, next);
  },
);

router.get(
  "/:id",
  authGuard,
  checkResourceOwnerOrAdmin("activities"),
  function (req: Request, res: Response, next: NextFunction): void {
    activityController.getById(req, res, next);
  },
);

router.get("/feed/global", authGuard, (req, res, next) =>
  activityController.getGlobalFeed(req, res, next),
);

router.get("/feed/friends/:id", authGuard, checkAdminOrSelf, (req, res, next) =>
  activityController.getFriendsFeed(req, res, next),
);

router.get(
  "/feed/discovery/:id",
  authGuard,
  checkAdminOrSelf,
  (req, res, next) => activityController.getDiscoveryFeed(req, res, next),
);

router.delete(
  "/:id",
  authGuard,
  checkResourceOwnerOrAdmin("activities"),
  function (req: Request, res: Response, next: NextFunction): void {
    activityController.delete(req, res, next);
  },
);

export default router;
