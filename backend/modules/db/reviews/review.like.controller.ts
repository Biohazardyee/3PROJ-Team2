import type {Request, Response, NextFunction} from 'express';

import {Controller} from '../../controller.js';
import {BadRequest} from '../../../utils/errors.js';
import {ReviewLikeService, reviewLikeService} from './review.like.service.js';

class ReviewLikeController extends Controller {

    constructor(private readonly service: ReviewLikeService = reviewLikeService) {
        super();
    }

    async add(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const {
                user_id,
                review_id,
            } = req.body;

            if (!review_id || !user_id) {
                throw new BadRequest('User_id & review_id are required');
            }

            const reviewLike = await this.service.create({
                review_id,
                user_id,
                created_at: new Date(),
            });

            res.status(201).json({
                message: 'Like created successfully',
                reviewLike,
            });
        } catch (err) {
            next(err);
        }
    }

    async getAll(_: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const reviewsLike = await this.service.getAll();
            res.status(201).json({
                message: 'All likes retrieved successfully',
                reviewsLike,
            });
        } catch (err) {
            next(err);
        }
    }

    async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const {
                user_id,
                review_id
            } = req.params;

            if (!user_id || !review_id) {
                throw new BadRequest('User_id & review_id are required');
            }

            const reviewsLike = await this.service.getById(user_id, review_id);
            res.status(201).json({
                message: `Like retrieved successfully`,
                reviewsLike,
            });
        } catch (err) {
            next(err);
        }
    }

    async update(): Promise<null> {
        // This function don't have to be used for this table
        return null
    }

    async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const {
                user_id,
                review_id
            } = req.params;

            if (!user_id || !review_id) {
                throw new BadRequest('User_id & review_id are required');
            }

            const reviewsLike = await this.service.delete(user_id, review_id);
            res.json({
                message: 'Like deleted successfully',
                reviewsLike,
            });
        } catch (err) {
            next(err);
        }
    }
}

export default new ReviewLikeController();