import type { Request, Response, NextFunction } from 'express';

import { Controller } from '../controller.js';
import { BadRequest } from '../../utils/errors.js';
import { ActivityService } from './activity.service.js';

class ActivityController extends Controller {

    constructor(private readonly service = new ActivityService()) {
        super();
    }

    async add(req: Request, res: Response, next: NextFunction) {
        try {
            const {
                user_id,
                action,
                target_user_id,
                review_id,
                media_id,
                rating_from_user,
            } = req.body;

            if (!user_id || !action) {
                throw new BadRequest('user_id and action are required');
            }

            const activity = await this.service.create({
                user_id,
                action,
                target_user_id,
                review_id,
                media_id,
                rating_from_user,
            });

            res.status(201).json({
                message: 'Activity created successfully',
                activity,
            });
        } catch (error) {
            next(error);
        }
    }

    async getFeed(req: Request, res: Response, next: NextFunction) {
        try {
            const { user_id } = req.params;

            const activities = await this.service.getByUserFeed(user_id);

            res.status(200).json({
                message: 'Activity feed retrieved successfully',
                activities,
            });
        } catch (error) {
            next(error);
        }
    }

    async delete(req: Request, res: Response, next: NextFunction) {
        try {
            const { id } = req.params;

            const activity = await this.service.delete(id);

            res.status(200).json({
                message: 'Activity deleted',
                activity,
            });
        } catch (error) {
            next(error);
        }
    }

    async getAll(req: Request, res: Response, next: NextFunction) {
        try {
            const activities = await this.service.getAll();
            res.status(200).json(activities);
        } catch (error) {
            next(error);
        }
    }

    async getById(req: Request, res: Response, next: NextFunction) {
        try {
            const { id } = req.params;
            const activity = await this.service.getById(id);
            res.status(200).json(activity);
        } catch (error) {
            next(error);
        }
    }

    async update(_: Request, __: Response, next: NextFunction) {
        // Not implemented
        next();
    }

}

export default new ActivityController();
