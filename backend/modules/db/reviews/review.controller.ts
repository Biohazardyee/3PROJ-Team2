import type {Request, Response, NextFunction} from 'express';

import {Controller} from '../../controller.js';
import {BadRequest} from '../../../utils/errors.js'
import {ReviewService} from './review.service.js';
import {
    ReviewAddDto,
    ReviewResponseAddDto,
    ReviewResponseDeleteDto,
    ReviewResponseDto,
    ReviewUpdateDto
} from "../../../types/reviews/review.dto";

class ReviewController extends Controller {

    constructor(private readonly service = new ReviewService()) {
        super();
    }

    async add(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const createData: ReviewAddDto = {
                user_id: req.body.user_id,
                media_id: req.body.media_id,
                rating: req.body.rating,
                content: req.body.content,
            };

            if (!createData.user_id || !createData.media_id || !createData.rating || !createData.content) {
                throw new BadRequest('User_id, media_id, rating & content is required');
            }

            const review: ReviewResponseAddDto = await this.service.create(createData);

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
            const reviews: ReviewResponseDto[] = await this.service.getAll();
            res.status(201).json({
                message: 'Reviews retrieved successfully',
                reviews,
            });
        } catch (error) {
            next(error);
        }
    }

    async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            if (!req.params.id) {
                throw new BadRequest('Id is required');
            }
            const review: ReviewResponseDto = await this.service.getById(req.params.id);
            res.status(201).json({
                message: 'Review retrieved successfully',
                review
            });
        } catch (err) {
            next(err);
        }
    }

    async update(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const id: string = req.params.id;

            if (!id) {
                throw new BadRequest('Id is required');
            }

            const updateData: ReviewUpdateDto = {};

            if (req.body.rating !== undefined) {
                updateData.rating = req.body.rating;
            }

            if (req.body.content !== undefined) {
                updateData.content = req.body.content;
            }

            if (Object.keys(updateData).length === 0) {
                throw new BadRequest('No fields provided');
            }

            const review: ReviewResponseDto = await this.service.update(id, updateData);

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
                throw new BadRequest('Id is required');
            }

            const reviewDelete: ReviewResponseDeleteDto = await this.service.delete(req.params.id);

            res.status(201).json({
                message: 'Review deleted successfully',
                reviewDelete,
            });

        } catch (error) {
            next(error);
        }
    }
}

export default new ReviewController();