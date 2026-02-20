import {NextFunction, Request, Response, Router} from "express";
import playlistController from '../../modules/db/playlists/playlist.controller.js';
import {authGuard} from "../../middlewares/auth.js";
import {checkAdmin} from "../../middlewares/checkAdmin.js";
import {checkResourceOwnerOrAdmin} from "../../middlewares/checkResourceOwnerOrAdmin.js";

const router: Router = Router();

router.post('/', authGuard, function (req: Request, res: Response, next: NextFunction): void {
    playlistController.add(req, res, next);
});

router.get('/user/:id', authGuard, checkResourceOwnerOrAdmin('playlists'), function (req: Request, res: Response, next: NextFunction): void {
    playlistController.getPlaylistsByUserId(req, res, next);
});

router.get('/:id', authGuard, checkResourceOwnerOrAdmin('playlists'), function (req: Request, res: Response, next: NextFunction): void {
    playlistController.getById(req, res, next);
});

router.put('/:id', authGuard, checkResourceOwnerOrAdmin('playlists'), function (req: Request, res: Response, next: NextFunction): void {
    playlistController.update(req, res, next);
});

router.get('/', authGuard, checkAdmin, function (req: Request, res: Response, next: NextFunction): void {
    playlistController.getAll(req, res, next);
});

router.delete('/:id', authGuard, checkResourceOwnerOrAdmin('playlists'), function (req: Request, res: Response, next: NextFunction): void {
    playlistController.delete(req, res, next);
});

export default router;