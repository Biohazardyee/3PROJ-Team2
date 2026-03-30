import type { Request, Response, NextFunction } from 'express';
import { PrismaDb } from '../../../config/database.js';
import { Controller } from '../../controller.js';
import { BadRequest } from '../../../utils/errors.js';
import { ReviewLikeService, reviewLikeService } from './review.like.service.js';
import { ReviewLikeAddDto, ReviewLikeResponseDto } from "../../../types/reviews/review.like.dto.js";

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
                message: 'Like created successfully',
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

    async getById(req: Request, res: Response, next: NextFunction) {
        try {
            const { id } = req.params;
            const userId = (req as any).user?.id;

            const review = await this.service.getById(id, userId);

            res.status(200).json({
                message: 'Review retrieved successfully',
                review,
            });
        } catch (error) {
            next(error);
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

            const reviewsLike: ReviewLikeResponseDto = await this.service.delete(req.params.review_id, req.params.user_id);
            res.status(201).json({
                message: 'Like deleted successfully',
                reviewsLike,
            });
        } catch (err) {
            next(err);
        }
    }

    async toggleLike(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { review_id } = req.body;
            const user_id = (req as any).user?.id;

            if (!user_id) {
                throw new BadRequest('User authentication required');
            }

            if (!review_id) {
                throw new BadRequest('Review_id is required');
            }

            const existingLike = await PrismaDb.reviewLikes.findUnique({
                where: { user_id_review_id: { user_id, review_id } }
            });

            if (existingLike) {
                await this.service.delete(review_id, user_id);
                const likesCount = await PrismaDb.reviewLikes.count({ where: { review_id } });
                res.status(200).json({ message: 'Like removed', isLiked: false, likes_count: likesCount });
            } else {
                await this.service.create({ user_id, review_id });
                const likesCount = await PrismaDb.reviewLikes.count({ where: { review_id } });
                res.status(201).json({ message: 'Like added', isLiked: true, likes_count: likesCount });
            }
        } catch (error) {
            next(error);
        }
    }
}

export default new ReviewLikeController();