import type { Request, Response, NextFunction } from 'express';

import { Controller } from '../controller.js';
import { BadRequest } from '../../utils/errors.js';
import { NotificationService } from './notification.service.js';

class NotificationController {

    constructor(private readonly service = new NotificationService()) { }

    async add(req: Request, res: Response, next: NextFunction) {
        try {
            const { user_id, action, related_user_id, review_id, media_id } = req.body;

            if (!user_id || !action) {
                throw new BadRequest('user_id and action are required');
            }

            const notification = await this.service.create({
                user_id,
                action,
                related_user_id,
                review_id,
                media_id,
            });

            res.status(201).json({ message: 'Notification created successfully', notification });
        } catch (error) {
            next(error);
        }
    }

    async getByUser(req: Request, res: Response, next: NextFunction) {
        try {
            const { user_id } = req.params;
            if (!user_id) { 
                throw new BadRequest('user_id is required');
            }

            const notifications = await this.service.getByUserId(user_id);

            res.status(200).json({ message: 'Notifications retrieved successfully', notifications });
        } catch (error) {
            next(error);
        }
    }

    async update(req: Request, res: Response, next: NextFunction) {
        try {
            const { id } = req.params;
            if (!id) {
                throw new BadRequest('Notification id is required');
            }

            const notification = await this.service.update(id);
            res.status(200).json({ message: 'Notification marked as read', notification });
        } catch (error) {
            next(error);
        }
    }

    async delete(req: Request, res: Response, next: NextFunction) {
        try {
            const { id } = req.params;
            if (!id) {
                throw new BadRequest('Notification id is required');
            }

            const notification = await this.service.delete(id);
            res.status(200).json({ message: 'Notification deleted', notification });
        } catch (error) {
            next(error);
        }
    }

    async getAll(_: Request, res: Response, next: NextFunction) {
        try {
            const notifications = await this.service.getAll();
            res.status(200).json({ message: 'All notifications retrieved successfully', notifications });
        } catch (error) {
            next(error);
        }
    }

    async getById(req: Request, res: Response, next: NextFunction) {
        try {
            const { id } = req.params;
            if (!id) {
                throw new BadRequest('Notification id is required');
            }

            const notification = await this.service.getById(id);
            res.status(200).json({ message: 'Notification retrieved successfully', notification });
        } catch (error) {
            next(error);
        }
    }
}

export default new NotificationController();
