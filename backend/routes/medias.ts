import express from 'express';
import MediaController from '../modules/medias/media.controller.js';

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

export default router;
