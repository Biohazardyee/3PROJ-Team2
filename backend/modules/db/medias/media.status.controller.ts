import {Request, Response, NextFunction} from 'express';
import {BadRequest} from '../../../utils/errors.js';
import {MediaStatusService} from './media.status.service.js';
import {MediaStatus} from '../../../generated/prisma/enums.js';

class MediaStatusController {
    constructor(private readonly service = new MediaStatusService()) {
    }

    async add(req: Request, res: Response, next: NextFunction) {
        try {
            const {
                user_id, 
                media_id, 
                status
            } = req.body;

            if (!user_id) {
                throw new BadRequest('user_id is required')
            }
            if (!media_id) {
                throw new BadRequest('media_id is required')
            }

            if (!Object.values(MediaStatus).includes(status)) {
                throw new BadRequest(`Invalid status value. Must be one of: ${Object.values(MediaStatus).join(', ')}`);
            }

            const mediaStatus = await this.service.create({user_id, media_id, status});
            res.status(201).json({message: 'Media status created successfully', mediaStatus});

        } catch (error) {
            next(error);
        }
    }

    async update(req: Request, res: Response, next: NextFunction) {
        try {
            const {
                user_id, 
                media_id
            } = req.params;

            const {
                status
            } = req.body;

            if (!user_id) {
                throw new BadRequest('user_id is required')
            }

            if (!media_id) {
                throw new BadRequest('media_id is required')
            }

            if (!Object.values(MediaStatus).includes(status)) {
                throw new BadRequest(`Invalid status value. Must be one of: ${Object.values(MediaStatus).join(', ')}`);
            }

            const mediaStatus = await this.service.update(user_id, media_id, status);
            res.status(200).json({message: 'Media status updated successfully', mediaStatus});

        } catch (error) {
            next(error);
        }
    }

    async getStatus(req: Request, res: Response, next: NextFunction) {
        try {
            const {
                user_id, 
                media_id
            } = req.params;

            if (!user_id) {
                throw new BadRequest('user_id is required')
            }
            if (!media_id) {
                throw new BadRequest('media_id is required')
            }

            const mediaStatus = await this.service.getStatus(user_id, media_id);
            res.status(200).json({message: 'Media status retrieved successfully', mediaStatus});
        } catch (error) {
            next(error);
        }
    }

    async delete(req: Request, res: Response, next: NextFunction) {
        try {
            const {
                user_id, 
                media_id
            } = req.params;

            if (!user_id) {
                throw new BadRequest('user_id is required')
            }
            if (!media_id) {
                throw new BadRequest('media_id is required')
            }

            await this.service.delete(user_id, media_id);
            res.status(200).json({message: 'Media status deleted successfully'});
            
        } catch (error) {
            next(error);
        }
    }
}

export default new MediaStatusController();
