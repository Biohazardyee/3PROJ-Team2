import {Request, Response, NextFunction} from 'express';
import {BadRequest} from '../../../utils/errors.js';
import {MediaStatusService} from './media.status.service.js';
import {Controller} from "../../controller.js";
import {
    MediaStatusCreateDto,
    MediaStatusResponseDto,
    MediaStatusUpdateDto
} from "../../../types/medias/media.status.dto.js";

class MediaStatusController extends Controller {
    constructor(private readonly service = new MediaStatusService()) {
        super();
    }

    async add(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const createData: MediaStatusCreateDto = {
                user_id: req.body.user_id,
                media_id: req.body.media_id,
                status: req.body.status
            };

            if (!createData.user_id) {
                throw new BadRequest('User_id is required')
            }
            if (!createData.media_id) {
                throw new BadRequest('Media_id is required')
            }
            if (!createData.status) {
                throw new BadRequest('Status is required')
            }

            const mediaStatus: MediaStatusResponseDto = await this.service.create(createData);
            res.status(201).json({message: 'Media status created successfully', mediaStatus});

        } catch (error) {
            next(error);
        }
    }

    async getAll(_: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const mediasStatus: MediaStatusResponseDto[] = await this.service.getAll();
            res.status(201).json({message: 'UserMediasStatus retrieved successfully', mediasStatus});
        } catch (error) {
            next(error);
        }
    }

    async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            if (!req.params.user_id){
                throw new BadRequest('User_id is required');
            }
            if (!req.params.media_id){
                throw new BadRequest('Media_id is required');
            }
            const mediaStatus: MediaStatusResponseDto = await this.service.getById(req.params.user_id, req.params.media_id);
            res.status(201).json({message: 'MediaStatus retrieved successfully', mediaStatus});
        } catch (error) {
            next(error);
        }
    }

    async update(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const user_id: string = req.params.user_id;
            const media_id: string = req.params.media_id;

            if (!user_id) {
                throw new BadRequest('User_id is required');
            }
            if (!media_id) {
                throw new BadRequest('Media_id is required');
            }

            const updateData: MediaStatusUpdateDto = {};

            if (req.body.status !== undefined) {
                updateData.status = req.body.status;
            }

            const mediaStatus: MediaStatusResponseDto = await this.service.update(user_id, media_id, updateData);
            res.status(201).json({message: 'Media status updated successfully', mediaStatus});

        } catch (error) {
            next(error);
        }
    }

    async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            if (!req.params.user_id) {
                throw new BadRequest('User_id is required');
            }
            if (!req.params.media_id) {
                throw new BadRequest('Media_id is required');
            }

            const mediaStatus: MediaStatusResponseDto = await this.service.delete(req.params.user_id, req.params.media_id);
            res.status(201).json({message: 'MediaStatus deleted successfully', mediaStatus});
        } catch (error) {
            next(error);
        }
    }
}

export default new MediaStatusController();
