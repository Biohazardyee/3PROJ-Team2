import type {Request, Response, NextFunction} from 'express';
import {Controller} from '../../controller.js';
import {BadRequest} from '../../../utils/errors.js';
import {ReviewLikeService, reviewLikeService} from './review.like.service.js';
import {ReviewLikeAddDto, ReviewLikeResponseDto} from "../../../types/reviews/review.like.dto.js";

class ReviewLikeController extends Controller {

    constructor(private readonly service: ReviewLikeService = reviewLikeService) {
        super();
    }

    async add(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const createData: ReviewLikeAddDto = {
                user_id: req.body.user_id,
                review_id: req.body.review_id,
            };

            if (!createData.user_id || !createData.review_id) {
                throw new BadRequest('User_id & Review_id is required');
            }

            const review: ReviewLikeResponseDto = await this.service.create(createData);

            res.status(201).json({
                message: 'Review created successfully',
                review,
            });
        } catch (error) {
            next(error);
        }
    }

    async getAll(_: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const reviewsLikes: ReviewLikeResponseDto[] = await this.service.getAll();
            res.status(201).json({
                message: 'All likes retrieved successfully',
                reviewsLikes,
            });
        } catch (err) {
            next(err);
        }
    }

    async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {

            if (!req.params.user_id || !req.params.review_id) {
                throw new BadRequest('User_id & review_id are required');
            }

            const reviewsLike: ReviewLikeResponseDto = await this.service.getById(req.params.user_id, req.params.review_id);
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
            if (!req.params.user_id || !req.params.review_id) {
                throw new BadRequest('User_id & review_id are required');
            }

            const reviewsLike: ReviewLikeResponseDto = await this.service.delete(req.params.user_id, req.params.review_id);
            res.status(201).json({
                message: 'Like deleted successfully',
                reviewsLike,
            });
        } catch (err) {
            next(err);
        }
    }
}

export default new ReviewLikeController();