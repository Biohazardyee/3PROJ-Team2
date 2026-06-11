import {NextFunction, Request, Response, Router} from "express";
import reportController from "../../modules/db/reports/report.controller.js";
import {authGuard} from "../../middlewares/auth.js";
import {checkAdmin} from "../../middlewares/checkAdmin.js";
import {checkResourceOwnerOrAdmin} from "../../middlewares/checkResourceOwnerOrAdmin.js";

const router: Router = Router();

router.post(
    "/",
    authGuard,
    function (req: Request, res: Response, next: NextFunction): void {
        reportController.add(req, res, next);
    },
);

router.get(
    "/",
    authGuard,
    checkAdmin,
    function (req: Request, res: Response, next: NextFunction): void {
        reportController.getAll(req, res, next);
    },
);

router.get(
    "/:id",
    authGuard,
    checkResourceOwnerOrAdmin("reports"),
    function (req: Request, res: Response, next: NextFunction): void {
        reportController.getById(req, res, next);
    },
);

router.post(
    "/profile",
    authGuard,
    function (req: Request, res: Response, next: NextFunction): void {
        reportController.add(req, res, next);
    },
);

router.get(
    "/review/:review_id",
    authGuard,
    checkAdmin,
    function (req: Request, res: Response, next: NextFunction): void {
        reportController.getByReview(req, res, next);
    },
);

router.put(
    "/:id",
    authGuard,
    checkAdmin,
    function (req: Request, res: Response, next: NextFunction): void {
        reportController.update(req, res, next);
    },
);

router.delete(
    "/:id",
    authGuard,
    checkAdmin,
    function (req: Request, res: Response, next: NextFunction): void {
        reportController.delete(req, res, next);
    },
);

export default router;
