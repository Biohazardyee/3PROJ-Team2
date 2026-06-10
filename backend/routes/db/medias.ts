import express, {Router, Request, Response, NextFunction} from "express";
import MediaController from "../../modules/db/medias/media.controller.js";
import MediaStatusController from "../../modules/db/medias/media.status.controller.js";
import {authGuard} from "../../middlewares/auth.js";
import {checkAdmin} from "../../middlewares/checkAdmin.js";

const router: Router = express.Router();

router.post(
    "/status",
    authGuard,
    function (req: Request, res: Response, next: NextFunction): void {
        MediaStatusController.add(req, res, next);
    },
);

router.get(
    "/status",
    authGuard,
    checkAdmin,
    function (req: Request, res: Response, next: NextFunction): void {
        MediaStatusController.getAll(req, res, next);
    },
);

router.get(
    "/status/user/:user_id",
    authGuard,
    function (req: Request, res: Response, next: NextFunction): void {
        MediaStatusController.getByUser(req, res, next);
    },
);

router.get(
    "/status/:user_id/:media_id",
    authGuard,
    function (req: Request, res: Response, next: NextFunction): void {
        MediaStatusController.getById(req, res, next);
    },
);

router.put(
    "/status/:user_id/:media_id",
    authGuard,
    function (req: Request, res: Response, next: NextFunction): void {
        MediaStatusController.update(req, res, next);
    },
);

router.delete(
    "/status/:user_id/:media_id",
    authGuard,
    function (req: Request, res: Response, next: NextFunction): void {
        MediaStatusController.delete(req, res, next);
    },
);

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////

router.post(
    "/",
    authGuard,
    function (req: Request, res: Response, next: NextFunction): void {
        MediaController.add(req, res, next);
    },
);

router.post(
    "/sync-search",
    function (req: Request, res: Response, next: NextFunction): void {
        MediaController.syncSearchResults(req, res, next);
    },
);

router.get(
    "/trending",
    function (req: Request, res: Response, next: NextFunction): void {
        MediaController.getTrending(req, res, next);
    },
);

router.get(
    "/:id",
    function (req: Request, res: Response, next: NextFunction): void {
        MediaController.getById(req, res, next);
    },
);

router.get(
    "/",
    function (req: Request, res: Response, next: NextFunction): void {
        MediaController.getAll(req, res, next);
    },
);
router.put(
    "/:id",
    authGuard,
    function (req: Request, res: Response, next: NextFunction): void {
        MediaController.update(req, res, next);
    },
);

router.delete(
    "/:id",
    authGuard,
    checkAdmin,
    function (req: Request, res: Response, next: NextFunction): void {
        MediaController.delete(req, res, next);
    },
);

export default router;
