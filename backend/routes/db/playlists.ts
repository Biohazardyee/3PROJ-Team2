import express, {NextFunction, Router} from 'express';
import playlistController from '../../modules/db/playlists/playlist.controller.js';


var router: Router = express.Router();

router.post('/', function (req, res, next: NextFunction): void {
    playlistController.add(req, res, next);
});

router.get('/user/:user_id', function (req, res, next: NextFunction): void {
    playlistController.getPlaylistsByUserId(req, res, next);
});

router.get('/:id', function (req, res, next: NextFunction): void {
    playlistController.getById(req, res, next);
});

router.put('/:playlist_id', function (req, res, next: NextFunction): void {
    playlistController.update(req, res, next);
});

router.get('/', function (req, res, next: NextFunction): void {
    playlistController.getAll(req, res, next);
});

router.delete('/:id', function (req, res, next: NextFunction): void {
    playlistController.delete(req, res, next);
});

export default router;