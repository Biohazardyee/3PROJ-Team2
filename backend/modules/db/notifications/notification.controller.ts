import type {Request, Response, NextFunction} from 'express';

import {Controller} from '../../controller.js';
import {BadRequest} from '../../../utils/errors.js';
import {NotificationService} from './notification.service.js';
import {
    NotificationsCreationDto,
    NotificationsCreationResponseDto, NotificationsResponseDeleteDto, NotificationsResponseDto, NotificationsUpdateDto
} from "../../../types/notifications/notifications.dto.js";

class NotificationController extends Controller {

    constructor(private readonly service = new NotificationService()) {
        super();
    }

    async add(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {

            const creationData: NotificationsCreationDto = {
                user_id: req.body.user_id,
                action: req.body.action,
                related_user_id: req.body.related_user_id,
                review_id: req.body.review_id,
                media_id: req.body.media_id,
            }

            if (!creationData.user_id || !creationData.action) {
                throw new BadRequest('user_id and action are required');
            }

            const notification: NotificationsCreationResponseDto = await this.service.create(creationData);

            res.status(201).json(
                {
                    message: 'Notification created successfully',
                    notification
                });
        } catch (error) {
            next(error);
        }
    }

    async getByUser(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {

            if (!req.params.user_id) {
                throw new BadRequest('user_id is required');
            }

            const notifications: NotificationsResponseDto[] = await this.service.getByUserId(req.params.user_id);

            res.status(200).json({
                message: 'Notifications retrieved successfully',
                notifications
            });
        } catch (error) {
            next(error);
        }
    }

    async update(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            if (!req.params.id) {
                throw new BadRequest('Notification id is required');
            }

            const updateData: NotificationsUpdateDto = {}

            if (req.body.is_read !== undefined) {
                updateData.is_read = req.body.is_read;
            }

            if (Object.keys(updateData).length === 0) {
                throw new BadRequest("No fields provided");
            }

            const notification: NotificationsResponseDto = await this.service.update(req.params.id, updateData);

            res.status(200).json({
                message: 'Notification updated successfully',
                notification
            });
        } catch (error) {
            next(error);
        }
    }


    async getAll(_: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const notifications: NotificationsResponseDto[] = await this.service.getAll();
            res.status(200).json({
                message: 'All notifications retrieved successfully',
                notifications
            });
        } catch (error) {
            next(error);
        }
    }

    async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {

            if (!req.params.id) {
                throw new BadRequest('Notification id is required');
            }

            const notification: NotificationsResponseDto = await this.service.getById(req.params.id);
            res.status(200).json({
                message: 'Notification retrieved successfully',
                notification
            });
        } catch (error) {
            next(error);
        }
    }

    async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {

            if (!req.params.id) {
                throw new BadRequest('Notification id is required');
            }

            const notification: NotificationsResponseDeleteDto = await this.service.delete(req.params.id);
            res.status(200).json({
                message: 'Notification deleted',
                notification
            });
        } catch (error) {
            next(error);
        }
    }
}

export default new NotificationController();
