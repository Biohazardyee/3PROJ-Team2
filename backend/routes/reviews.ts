import express from 'express';
import ReviewController from '../modules/reviews/review.controller.js';

var router = express.Router();

router.post('/', function (req, res, next) {
    ReviewController.add(req, res, next);
});

router.get('/:id', function (req, res, next) {
    ReviewController.getById(req, res, next);
});

router.get('/', function (req, res, next) {
    ReviewController.getAll(req, res, next);
});

router.put('/:id', function (req, res, next) {
    ReviewController.update(req, res, next);
});

router.delete('/:id', function (req, res, next) {
    ReviewController.delete(req, res, next);
});

export default router;
