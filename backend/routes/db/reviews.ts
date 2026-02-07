import express, {NextFunction, Router} from 'express';
import ReviewController from '../../modules/db/reviews/review.controller.js';
import ReviewLikeController from "../../modules/db/reviews/review.like.controller.js";
import ReviewCommentController from "../../modules/db/reviews/review.comment.controller.js";

var router: Router = express.Router();

router.post('/', function (req, res, next: NextFunction): void {
    ReviewController.add(req, res, next);
});

router.post('/likes', function (req, res, next: NextFunction): void {
    ReviewLikeController.add(req, res, next);
});

router.post('/comments', function (req, res, next: NextFunction): void {
    ReviewCommentController.add(req, res, next);
});

router.get('/', function (req, res, next: NextFunction): void {
    ReviewController.getAll(req, res, next);
});

router.get('/likes', (req, res, next: NextFunction): void => {
    ReviewLikeController.getAll(req, res, next);
});

router.get('/comments', (req, res, next: NextFunction): void => {
    ReviewCommentController.getAll(req, res, next);
});

router.get('/:id', function (req, res, next: NextFunction): void {
    ReviewController.getById(req, res, next);
});

router.get('/likes/:review_id/:user_id', (req, res, next: NextFunction): void => {
    ReviewLikeController.getById(req, res, next);
});

router.get('/comments/:id', (req, res, next: NextFunction): void => {
    ReviewCommentController.getById(req, res, next);
});

router.put('/:id', function (req, res, next: NextFunction): void {
    ReviewController.update(req, res, next);
});

router.put('/comments/:id', function (req, res, next: NextFunction): void {
    ReviewCommentController.update(req, res, next);
});

router.delete('/:id', function (req, res, next: NextFunction): void {
    ReviewController.delete(req, res, next);
});

router.delete('/likes/:review_id/:user_id', (req, res, next: NextFunction): void => {
    ReviewLikeController.delete(req, res, next);
});

router.delete('/comments/:id', (req, res, next: NextFunction): void => {
    ReviewCommentController.delete(req, res, next);
});

export default router;