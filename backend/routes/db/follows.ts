import {NextFunction, Request, Response, Router} from "express";
import followController from '../../modules/db/follows/follow.controller.js';
import {authGuard} from "../../middlewares/auth.js";


const router: Router = Router();

router.post('/', authGuard, function (req: Request, res: Response, next: NextFunction): void {
    followController.create(req, res, next);
});

router.delete('/', authGuard, function (req: Request, res: Response, next: NextFunction): void {
    followController.delete(req, res, next);
});

router.get('/followers/:user_id', authGuard, function (req: Request, res: Response, next: NextFunction): void {
    followController.getFollowers(req, res, next);
});

router.get('/following/:user_id', authGuard, function (req: Request, res: Response, next: NextFunction): void {
    followController.getFollowing(req, res, next);
});

router.get('/mutuals/:user_id', authGuard, function (req: Request, res: Response, next: NextFunction): void {
    followController.getMutuals(req, res, next);
});

export default router;
