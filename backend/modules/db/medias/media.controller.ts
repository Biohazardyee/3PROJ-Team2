import type {Request, Response, NextFunction} from 'express';
import {Controller} from '../../controller.js';
import {BadRequest} from '../../../utils/errors.js';
import {MediaService} from './media.service.js';
import {isValidApiId} from '../../../utils/helpers.js';
import {MediaCreateDto, MediaResponseDto, MediaUpdateDto} from "../../../types/medias/media.dto.js";

class MediaController extends Controller {
    constructor(private readonly service = new MediaService()) {
        super();
    }

    async add(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const createData: MediaCreateDto = {
                api_id: req.body.api_id,
            };

            if (!createData.api_id) {
                throw new BadRequest('API ID is required');
            }

            if (!isValidApiId(req.body.api_id)) {
                throw new BadRequest('api_id is required and must be a valid string');
            }

            const media: MediaResponseDto = await this.service.create(createData);

            res.status(201).json({message: 'Media created successfully', media});

        } catch (error) {
            next(error);
        }
    }

    async getAll(_: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const medias: MediaResponseDto[] = await this.service.getAll();
            res.status(201).json({message: 'Medias retrieved successfully', medias});
        } catch (error) {
            next(error);
        }
    }

    async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            if (!req.params.id){
                throw new BadRequest('Id is required');
            }

            const media: MediaResponseDto = await this.service.getById(req.params.id);
            res.status(201).json({message: 'Media retrieved successfully', media});
        } catch (error) {
            next(error);
        }
    }

    async update(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const id: string = req.params.id;

            if (!id) {
                throw new BadRequest('Id is required');
            }
            const updateData: MediaUpdateDto = {};

            if (req.body.api_id !== undefined) {
                updateData.api_id = req.body.api_id;
            }

            const media: MediaResponseDto = await this.service.update(id, updateData);
            res.status(201).json({message: 'Media updated successfully', media});
        } catch (error) {
            next(error);
        }
    }

    async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            if (!req.params.id) {
                throw new BadRequest('Id is required');
            }

            const media: MediaResponseDto = await this.service.delete(req.params.id);
            res.status(201).json({message: 'Media deleted successfully', media});
        } catch (error) {
            next(error);
        }
    }
}

export default new MediaController();
