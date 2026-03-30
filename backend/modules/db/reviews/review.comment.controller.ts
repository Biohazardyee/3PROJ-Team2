import type { Request, Response, NextFunction } from 'express';
import { Controller } from '../../controller.js';
import { BadRequest } from '../../../utils/errors.js';
import { ReviewCommentService, reviewCommentService } from './review.comment.service.js';
import {
    ReviewCommentAddDto,
    ReviewCommentResponseDto,
    ReviewCommentUpdateDto
} from "../../../types/reviews/review.comment.dto.js";
import { getThreadByReview, toggleLike } from './review.comment.helper.js';

class ReviewCommentController extends Controller {

    constructor(private readonly service: ReviewCommentService = reviewCommentService) {
        super();
    }

    async add(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const createData: ReviewCommentAddDto = {
                // ON RÉCUPÈRE L'ID DEPUIS LE TOKEN (req.user), PAS DEPUIS LE BODY
                user_id: (req as any).user?.id || req.body.user_id,
                review_id: req.body.review_id,
                content: req.body.content,
                parent_id: req.body.parent_id
            };

            if (!createData.user_id || !createData.review_id || !createData.content) {
                throw new BadRequest('Review_id, user_id and content are required');
            }

            const reviewComment: ReviewCommentResponseDto = await this.service.create(createData);

            res.status(201).json({
                message: 'Comment created successfully',
                reviewComment,
            });
        } catch (err) {
            next(err);
        }
    }

    async getAll(_: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const reviewsComment: ReviewCommentResponseDto[] = await this.service.getAll();
            res.status(201).json({
                message: 'All comments retrieved successfully',
                reviewsComment,
            });
        } catch (err) {
            next(err);
        }
    }

    async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {

            if (!req.params.id) {
                throw new BadRequest('ID is required');
            }

            const reviewComment: ReviewCommentResponseDto = await this.service.getById(req.params.id);

            res.status(201).json({
                message: `Comment retrieved successfully`,
                reviewComment,
            });
        } catch (err) {
            next(err);
        }
    }

    async getByReviewId(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const reviewId = req.params.review_id;
            const userId = (req as any).user?.id; 

            const comments = await getThreadByReview(reviewId, userId);

            res.status(200).json({
                message: 'Comments retrieved successfully',
                comments,
            });
        } catch (err) {
            next(err);
        }
    }

    async update(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const id = req.params.id;

            if (!id) {
                throw new BadRequest('ID is required');
            }

            const updateData: ReviewCommentUpdateDto = {};

            if (req.body.content !== undefined) {
                updateData.content = req.body.content;
            }

            if (Object.keys(updateData).length === 0) {
                throw new BadRequest('No fields provided');
            }

            const review: ReviewCommentResponseDto = await this.service.update(id, updateData);

            res.status(201).json({
                message: 'Review updated successfully',
                review,
            });
        } catch (err) {
            next(err);
        }
    }

    async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {

            if (!req.params.id) {
                throw new BadRequest('ID is required');
            }

            const reviewComment: ReviewCommentResponseDto = await this.service.delete(req.params.id);

            res.status(201).json({
                message: 'Comment deleted successfully',
                reviewComment,
            });
        } catch (err) {
            next(err);
        }
    }

    async toggleLike(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const commentId = req.params.id;
            const userId = (req as any).user?.id;

            if (!commentId) throw new BadRequest("Comment ID is required");

            const result = await toggleLike(commentId, userId);

            res.status(200).json({
                message: result.isLiked ? "Comment liked" : "Comment unliked",
                ...result
            });
        } catch (err) {
            next(err);
        }
    }
}

export default new ReviewCommentController();