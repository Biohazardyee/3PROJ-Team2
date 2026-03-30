import express, { Request, Response, NextFunction, Router } from 'express';
import ReviewController from '../../modules/db/reviews/review.controller.js';
import { authGuard } from "../../middlewares/auth.js";
import { checkAdmin } from "../../middlewares/checkAdmin.js";
import ReviewLikeController from "../../modules/db/reviews/review.like.controller.js";
import { checkResourceOwnerOrAdmin } from "../../middlewares/checkResourceOwnerOrAdmin.js";

const router: Router = express.Router();


router.post('/likes', authGuard, (req, res, next) => {
    ReviewLikeController.add(req, res, next);
});

router.post('/likes/toggle', authGuard, (req, res, next) => {
    ReviewLikeController.toggleLike(req, res, next);
});

router.get('/likes', authGuard, checkAdmin, (req, res, next) => {
    ReviewLikeController.getAll(req, res, next);
});

router.get('/likes/:review_id/:user_id', authGuard, checkResourceOwnerOrAdmin('reviews'), (req, res, next) => {
    ReviewLikeController.getById(req, res, next);
});

router.delete('/likes/:review_id/:user_id', authGuard, checkResourceOwnerOrAdmin('reviews'), (req, res, next) => {
    ReviewLikeController.delete(req, res, next);
});


router.get('/', authGuard, (req, res, next) => {
    ReviewController.getAll(req, res, next);
});

router.get('/:id', authGuard, (req, res, next) => {
    ReviewController.getById(req, res, next);
});

router.post('/', authGuard, (req, res, next) => {
    ReviewController.add(req, res, next);
});

router.put('/:id', authGuard, checkResourceOwnerOrAdmin('reviews'), (req, res, next) => {
    ReviewController.update(req, res, next);
});

router.delete('/:id', authGuard, checkResourceOwnerOrAdmin('reviews'), (req, res, next) => {
    ReviewController.delete(req, res, next);
});

export default router;