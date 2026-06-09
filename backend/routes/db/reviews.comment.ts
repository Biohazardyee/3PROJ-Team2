import express, { Router } from 'express';
import { authGuard } from "../../middlewares/auth.js";
import reviewCommentController from '../../modules/db/reviews/review.comment.controller.js';

const router: Router = express.Router();

router.get('/review/:review_id', (req, res, next) =>
    reviewCommentController.getByReviewId(req, res, next)
);

router.get('/:id', (req, res, next) =>
    reviewCommentController.getById(req, res, next)
);

router.post('/', authGuard, (req, res, next) =>
    reviewCommentController.add(req, res, next)
);


router.post('/:id/toggle-like', authGuard, (req, res, next) =>
    reviewCommentController.toggleLike(req, res, next)
);


router.put('/:id', authGuard, (req, res, next) =>
    reviewCommentController.update(req, res, next)
);


router.delete('/:id', authGuard, (req, res, next) =>
    reviewCommentController.delete(req, res, next)
);

export default router;