import type {Request, Response, NextFunction} from 'express';
import {Controller} from '../../controller.js';
import {BadRequest} from '../../../utils/errors.js';
import {ActivityService, activityService} from './activity.service.js';
import {
    ActivityAddDto,
    ActivityDeleteResponseDto,
    ActivityResponseDto, FeedItem
} from '../../../types/activities/activities.dto.js';

class ActivityController extends Controller {

    constructor(private readonly service: ActivityService = activityService) {
        super();
    }

    async add(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {

            const ActivityCreationData: ActivityAddDto = {
                user_id: req.body.user_id,
                action: req.body.action,
                target_user_id: req.body.target_user_id,
                review_id: req.body.review_id,
                media_id: req.body.media_id,
                rating_from_user: req.body.rating_from_user,
            }

            if (!ActivityCreationData.user_id || !ActivityCreationData.action) {
                throw new BadRequest('user_id and action are required');
            }

            const activity: ActivityResponseDto = await this.service.create(ActivityCreationData);

            res.status(201).json({
                message: 'Activity created successfully',
                activity,
            });
        } catch (error) {
            next(error);
        }
    }

    // async getFeed(req: Request, res: Response, next: NextFunction): Promise<void> {
    //     try {
    //
    //
    //         if (!req.params.user_id) {
    //             throw new BadRequest('user_id is required')
    //         }
    //
    //         const activities: ActivityResponseDto[] = await this.service.getByUserFeed(req.params.user_id);
    //
    //         res.status(201).json({
    //             message: 'Activity feed retrieved successfully',
    //             activities,
    //         });
    //     } catch (error) {
    //         next(error);
    //     }
    // }

    async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {


            if (!req.params.id) {
                throw new BadRequest('Activity id is required');
            }

            const activity: ActivityDeleteResponseDto = await this.service.delete(req.params.id);

            res.status(201).json({
                message: 'Activity deleted',
                activity,
            });
        } catch (error) {
            next(error);
        }
    }

    async getAll(_: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const activities: ActivityResponseDto[] = await this.service.getAll();
            res.status(201).json(
                {
                    message: 'Retrieved activities list successfully',
                    activities
                });
        } catch (error) {
            next(error);
        }
    }

    async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {

            if (!req.params.id) {
                throw new BadRequest('Activity id is required');
            }

            const activity: ActivityResponseDto = await this.service.getById(req.params.id);
            res.status(201).json(activity);
        } catch (error) {
            next(error);
        }
    }

    async update(_: Request, __: Response, next: NextFunction): Promise<void> {
        // Not implemented
        next();
    }

    async getFeed(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const user_id: string = req.params.user_id;
            const limit: number = parseInt(req.query.limit as string) || 20;
            const offset: number = parseInt(req.query.offset as string) || 0;

            const feed: FeedItem[] = await this.service.getUserFeed(user_id, limit, offset);

            res.status(200).json({ message: 'Feed retrieved', feed });
        } catch (err) {
            next(err);
        }
    }
}

export default new ActivityController();
