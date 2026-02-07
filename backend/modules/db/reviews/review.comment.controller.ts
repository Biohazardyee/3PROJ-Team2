import type {Request, Response, NextFunction} from 'express';

import {Controller} from '../../controller.js';
import {BadRequest} from '../../../utils/errors.js';
import {ReviewCommentService, reviewCommentService} from './review.comment.service.js';

class ReviewCommentController extends Controller {

    constructor(private readonly service: ReviewCommentService = reviewCommentService) {
        super();
    }

    async add(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const {
                user_id,
                review_id,
                content,
            } = req.body;

            if (!review_id) {
                throw new BadRequest('Review_id is required');
            }

            if (!user_id) {
                throw new BadRequest('User_id is required');
            }

            if (!content) {
                throw new BadRequest('Content is required');
            }

            const reviewComment = await this.service.create({
                review_id,
                user_id,
                content,
                created_at: new Date(),
            });

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
            const reviewsComment = await this.service.getAll();
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
            const {
                id
            } = req.params;

            if (!id) {
                throw new BadRequest('ID is required');
            }

            const reviewComment = await this.service.getById(id);

            res.status(201).json({
                message: `Comment retrieved successfully`,
                reviewComment,
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

            const {
                content,
            } = req.body;

            let data: any = {}

            if (content) {
                data.content = content;
            }

            if (Object.keys(data).length === 0) {
                throw new BadRequest("No fields provided")
            }

            const reviewComment = this.service.update(id, data)

            res.status(201).json({
                message: `Comment updated successfully`,
                reviewComment,
            });
        } catch (err) {
            next(err);
        }
    }

    async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const {
                id
            } = req.params;

            if (!id) {
                throw new BadRequest('ID is required');
            }

            const reviewComment = await this.service.delete(id);
            res.json({
                message: 'Comment deleted successfully',
                reviewComment,
            });
        } catch (err) {
            next(err);
        }
    }
}

export default new ReviewCommentController();