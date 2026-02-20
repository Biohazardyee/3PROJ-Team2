import express, {Request, Response, NextFunction, Router} from 'express';
import ReviewController from '../../modules/db/reviews/review.controller.js';
import {authGuard} from "../../middlewares/auth.js";
import {checkAdmin} from "../../middlewares/checkAdmin.js";
import ReviewLikeController from "../../modules/db/reviews/review.like.controller.js";
import ReviewCommentController from "../../modules/db/reviews/review.comment.controller.js";
import {checkResourceOwnerOrAdmin} from "../../middlewares/checkResourceOwnerOrAdmin.js";

var router: Router = express.Router();

// LIKES
router.post('/likes', authGuard, function (req: Request, res: Response, next: NextFunction): void {
    ReviewLikeController.add(req, res, next);
});

router.get('/likes', authGuard, checkAdmin, function (req: Request, res: Response, next: NextFunction): void {
    ReviewLikeController.getAll(req, res, next);
});

router.get('/likes/:review_id/:user_id', authGuard, checkResourceOwnerOrAdmin('reviews'), function (req: Request, res: Response, next: NextFunction): void {
    ReviewLikeController.getById(req, res, next);
});

router.delete('/likes/:review_id/:user_id', authGuard, checkResourceOwnerOrAdmin('reviews'), function (req: Request, res: Response, next: NextFunction): void {
    ReviewLikeController.delete(req, res, next);
});

// COMMENTS
router.get('/comments', authGuard, checkAdmin, function (req: Request, res: Response, next: NextFunction): void {
    ReviewCommentController.getAll(req, res, next);
});

router.get('/comments/:id', (req: Request, res: Response, next: NextFunction): void => {
    ReviewCommentController.getById(req, res, next);
});

router.post('/comments', authGuard, function (req: Request, res: Response, next: NextFunction): void {
    ReviewCommentController.add(req, res, next);
});

router.put('/comments/:id', function (req: Request, res: Response, next: NextFunction): void {
    ReviewCommentController.update(req, res, next);
});

router.delete('/comments/:id', (req: Request, res: Response, next: NextFunction): void => {
    ReviewCommentController.delete(req, res, next);
});

// REVIEWS
router.get('/', authGuard, function (req: Request, res: Response, next: NextFunction): void {
    ReviewController.getAll(req, res, next);
});

router.get('/:id', authGuard, function (req: Request, res: Response, next: NextFunction): void {
    ReviewController.getById(req, res, next);
});

router.post('/', authGuard, function (req: Request, res: Response, next: NextFunction): void {
    ReviewController.add(req, res, next);
});

router.put('/:id', authGuard, checkResourceOwnerOrAdmin('reviews'), function (req: Request, res: Response, next: NextFunction): void {
    ReviewController.update(req, res, next);
});

router.delete('/:id', authGuard, checkResourceOwnerOrAdmin('reviews'), function (req: Request, res: Response, next: NextFunction): void {
    ReviewController.delete(req, res, next);
});



export default router;