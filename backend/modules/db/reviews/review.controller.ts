import type {Request, Response, NextFunction} from 'express';

import {Controller} from '../../controller.js';
import {BadRequest} from '../../../utils/errors.js'
import {ReviewService} from './review.service.js';

class ReviewController extends Controller {

    constructor(private readonly service = new ReviewService()) {
        super();
    }

    async add(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const {
                user_id,
                media_id,
                rating,
                content
            } = req.body;

            if (!user_id || !media_id || !rating || !content) {
                throw new BadRequest('Missing required fields');
            }
            const review = await this.service.create({
                user_id,
                media_id,
                rating,
                content,
                created_at: new Date()
            });
            res.status(201).json({
                message: 'Review created successfully',
                review,
            });
        } catch (error) {
            next(error);
        }
    }

    async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const {
                id
            } = req.params;

            if (!id) {
                throw new BadRequest('Missing required fields');
            }
            const review = await this.service.getById(id);
            res.status(200).json({
                message: 'Review retrieved successfully',
                review,
            });
        } catch (error) {
            next(error);
        }
    }

    async getAll(_: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const reviews = await this.service.getAll();
            res.status(200).json({
                message: 'Reviews retrieved successfully',
                reviews,
            });
        } catch (error) {
            next(error);
        }
    }

    async update(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const {
                id
            } = req.params;

            if (!id) {
                throw new BadRequest('Missing required fields');
            }

            const {
                user_id,
                media_id,
                rating,
                content
            } = req.body;

            let data: any = {}

            if (user_id) {
                data.user_id = user_id;
            }

            if (media_id) {
                data.media_id = media_id;
            }

            if (rating) {
                data.rating = rating;
            }

            if (content) {
                data.content = content;
            }

            if (Object.keys(data).length === 0) {
                throw new BadRequest("No fields provided")
            }

            const review = await this.service.update(id, data);

            res.status(200).json({
                message: 'Review updated successfully',
                review,
            });
        } catch (error) {
            next(error);
        }
    }

    async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const {
                id
            } = req.params;
            await this.service.delete(id);
            res.status(200).json({
                message: 'Review deleted successfully',
            });
        } catch (error) {
            next(error);
        }
    }
}

export default new ReviewController();