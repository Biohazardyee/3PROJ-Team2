import express from 'express';
import MediaController from '../modules/medias/media.controller.js';
import MediaStatusController from '../modules/medias/media.status.controller.js';

var router = express.Router();

router.post('/', function (req, res, next) {
    MediaController.add(req, res, next);
});

router.get('/:id', function (req, res, next) {
    MediaController.getById(req, res, next);
});

router.get('/', function (req, res, next) {
    MediaController.getAll(req, res, next);
});

router.put('/:id', function (req, res, next) {
    MediaController.update(req, res, next);
});

router.delete('/:id', function (req, res, next) {
    MediaController.delete(req, res, next);
});

router.get('/status/:user_id/:media_id', function (req, res, next) {
    MediaStatusController.getStatus(req, res, next);
});

router.post('/status', function (req, res, next) {
    MediaStatusController.add(req, res, next);
});

router.put('/status/:user_id/:media_id', function (req, res, next) {
    MediaStatusController.update(req, res, next);
});

router.delete('/status/:user_id/:media_id', function (req, res, next) {
    MediaStatusController.delete(req, res, next);
});

export default router;
