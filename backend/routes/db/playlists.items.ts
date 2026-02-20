import {NextFunction, Request, Response, Router} from "express";
import playlistItemController from '../../modules/db/playlists/playlist.item.controller.js';
import {authGuard} from "../../middlewares/auth.js";
import {checkAdmin} from "../../middlewares/checkAdmin.js";

const router: Router = Router();

router.post('/', authGuard, function(req: Request, res: Response, next: NextFunction): void {
    playlistItemController.add(req, res, next);
});

router.get('/', authGuard, checkAdmin, function(req: Request, res: Response, next: NextFunction): void {
    playlistItemController.getAll(req, res, next);
});

router.get('/:id', authGuard, function(req: Request, res: Response, next: NextFunction): void {
    playlistItemController.getById(req, res, next);
});

router.get('/:playlist_id', authGuard, function(req: Request, res: Response, next: NextFunction): void {
    playlistItemController.getByPlaylistId(req, res, next);
});

router.delete('/:id', authGuard, function(req: Request, res: Response, next: NextFunction): void {
    playlistItemController.delete(req, res, next);
});

export default router;
