import express, {Request, Response, NextFunction, Router} from "express";
import userController from "../../modules/db/users/user.controller.js";
import {authGuard} from "../../middlewares/auth.js";
import {checkAdmin} from "../../middlewares/checkAdmin.js";
import {checkResourceOwnerOrAdmin} from "../../middlewares/checkResourceOwnerOrAdmin.js";

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
    "/verify-email",
    function (req: Request, res: Response, next: NextFunction): void {
        userController.verifyEmail(req, res, next);
    },
);

router.post(
    "/resend-verification",
    function (req: Request, res: Response, next: NextFunction): void {
        userController.resendVerification(req, res, next);
    },
);

router.post(
    "/forgot-password",
    function (req: Request, res: Response, next: NextFunction): void {
        userController.forgotPassword(req, res, next);
    },
);

router.post(
    "/reset-password",
    function (req: Request, res: Response, next: NextFunction): void {
        userController.resetPassword(req, res, next);
    },
);

// --- 2FA (TOTP) ---
router.post(
    "/2fa/login-verify",
    function (req: Request, res: Response, next: NextFunction): void {
        userController.verifyTwoFactorLogin(req, res, next);
    },
);

router.post(
    "/2fa/setup",
    authGuard,
    function (req: Request, res: Response, next: NextFunction): void {
        userController.setupTwoFactor(req, res, next);
    },
);

router.post(
    "/2fa/confirm",
    authGuard,
    function (req: Request, res: Response, next: NextFunction): void {
        userController.confirmTwoFactor(req, res, next);
    },
);

router.post(
    "/2fa/backup-codes/regenerate",
    authGuard,
    function (req: Request, res: Response, next: NextFunction): void {
        userController.regenerateBackupCodes(req, res, next);
    },
);

router.post(
    "/2fa/disable",
    authGuard,
    function (req: Request, res: Response, next: NextFunction): void {
        userController.disableTwoFactor(req, res, next);
    },
);


router.post(
    "/update-push-token",
    authGuard,
    function (req: Request, res: Response, next: NextFunction): void {
        userController.updatePushToken(req, res, next);
    },
);

// --- Cosmétiques (boutique) ---
router.get(
    "/cosmetics/catalog",
    authGuard,
    function (req: Request, res: Response, next: NextFunction): void {
        userController.getCosmeticsCatalog(req, res, next);
    },
);

router.post(
    "/cosmetics/buy",
    authGuard,
    function (req: Request, res: Response, next: NextFunction): void {
        userController.buyCosmetic(req, res, next);
    },
);

router.post(
    "/cosmetics/equip",
    authGuard,
    function (req: Request, res: Response, next: NextFunction): void {
        userController.equipCosmetic(req, res, next);
    },
);

router.get(
    "/export",
    authGuard,
    function (req: Request, res: Response, next: NextFunction): void {
        userController.exportData(req, res, next);
    },
);

router.get(
    "/search",
    authGuard,
    function (req: Request, res: Response, next: NextFunction): void {
        userController.search(req, res, next);
    },
);

router.get(
    "/public/:id",

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
