import {NextFunction, Request, Response, Router} from "express";
import playlistController from '../../modules/db/playlists/playlist.controller.js';
import {authGuard} from "../../middlewares/auth.js";
import {checkAdmin} from "../../middlewares/checkAdmin.js";
import {checkResourceOwnerOrAdmin} from "../../middlewares/checkResourceOwnerOrAdmin.js";
import {checkPlaylistViewer} from "../../middlewares/checkPlaylistViewer.js";

const router: Router = Router();

router.post('/', authGuard, function (req: Request, res: Response, next: NextFunction): void {
    playlistController.add(req, res, next);
});

router.get('/user/:id', authGuard, function (req: Request, res: Response, next: NextFunction): void {
    playlistController.getPlaylistsByUserId(req, res, next);
});

router.get('/:id', authGuard, checkPlaylistViewer, function (req: Request, res: Response, next: NextFunction): void {
    playlistController.getById(req, res, next);
});

router.get('/:id/collaborators', authGuard, function (req: Request, res: Response, next: NextFunction): void {
    playlistController.getCollaborators(req, res, next);
});

router.post('/:id/collaborators', authGuard, function (req: Request, res: Response, next: NextFunction): void {
    playlistController.addCollaborator(req, res, next);
});

router.delete('/:id/collaborators/me', authGuard, function (req: Request, res: Response, next: NextFunction): void {
    playlistController.leaveCollaboration(req, res, next);
});

router.delete('/:id/collaborators/:user_id', authGuard, function (req: Request, res: Response, next: NextFunction): void {
    playlistController.removeCollaborator(req, res, next);
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