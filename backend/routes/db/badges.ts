import express, {Request, Response, NextFunction, Router} from "express";
import badgeController from "../../modules/db/badges/badge.controller.js";
import {authGuard} from "../../middlewares/auth.js";

const router: Router = express.Router();

router.get(
    "/catalog",
    authGuard,
    function (req: Request, res: Response, next: NextFunction): void {
        badgeController.getCatalog(req, res, next);
    },
);

router.get(
    "/user/:id",
    function (req: Request, res: Response, next: NextFunction): void {
        badgeController.getUserBadges(req, res, next);
    },
);

export default router;
