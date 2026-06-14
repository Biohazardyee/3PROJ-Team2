import { Router, NextFunction, Request, Response } from 'express';
import {authGuard} from "../../middlewares/auth.js";
import reportController from "../../modules/db/reports/report.controller.js";
import oauthController from "../../modules/oauth/oauth.controller.js";

const router: Router = Router();

router.post("/", authGuard, function (req: Request, res: Response, next: NextFunction): void {
    reportController.add(req, res, next);
});

// auth.routes.ts
router.get('/auth/google', function (req: Request, res: Response, next: NextFunction): void {
    oauthController.googleAuth(req, res, next);
});

router.get('/auth/google/callback', function (req: Request, res: Response, next: NextFunction): void {
    oauthController.googleCallback(req, res, next);
});

router.get('/auth/discord', function (req: Request, res: Response, next: NextFunction): void {
    oauthController.discordAuth(req, res, next);
});

router.get('/auth/discord/callback', function (req: Request, res: Response, next: NextFunction): void {
    oauthController.discordCallback(req, res, next);
});

// router.get('/auth/facebook', function (req: Request, res: Response, next: NextFunction): void {
//     oauthController.facebookAuth(req, res, next);
// });
//
// router.get('/auth/facebook/callback', function (req: Request, res: Response, next: NextFunction): void {
//     oauthController.facebookCallback(req, res, next);
// });

export default router;