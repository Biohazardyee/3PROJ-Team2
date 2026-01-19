import express from 'express';
import playlistController from '../modules/db/playlists/playlist.controller.js';


var router = express.Router();

router.post('/', function (req, res, next) {
    playlistController.add(req, res, next);
});

router.get('/user/:user_id', function (req, res, next) {
    playlistController.getPlaylistsByUserId(req, res, next);
});

router.get('/:id', function (req, res, next) {
    playlistController.getById(req, res, next);
});

router.put('/:playlist_id', function (req, res, next) {
    playlistController.update(req, res, next);
});

router.get('/', function (req, res, next) {
    playlistController.getAll(req, res, next);
});

router.delete('/:id', function (req, res, next) {
    playlistController.delete(req, res, next);
});

export default router;