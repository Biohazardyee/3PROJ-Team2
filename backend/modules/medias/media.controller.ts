import type {Request, Response, NextFunction} from 'express';
import {Controller} from '../controller.js';
import {BadRequest} from '../../utils/errors.js';
import {MediaService} from './media.service.js';
import {isEmptyString, isValidApiId} from '../../utils/helpers.js';

class MediaController extends Controller {
    constructor(private readonly service = new MediaService()) {
        super();
    }

    async add(req: Request, res: Response, next: NextFunction) {
        try {
            const {api_id} = req.body;
            if (!isValidApiId(api_id)) {
                throw new BadRequest('api_id is required and must be a valid string');
            }

            const media = await this.service.create({api_id});
            res.status(201).json({message: 'Media created successfully', media});
        } catch (error) {
            next(error);
        }
    }

    async update(req: Request, res: Response, next: NextFunction) {
        try {
            const {id} = req.params;
            const {api_id} = req.body;

            if (!id){
                throw new BadRequest('media id is required as a parameter');
            }

            if (api_id !== undefined && !isValidApiId(api_id)) {
                throw new BadRequest('api_id must be a valid string');
            }

            const media = await this.service.update(id, {api_id});
            res.status(200).json({message: 'Media updated successfully', media});
        } catch (error) {
            next(error);
        }
    }

    async getById(req: Request, res: Response, next: NextFunction) {
        try {
            const {id} = req.params;

            if (!id){
                throw new BadRequest('id is required');
            }


            const media = await this.service.getById(id);
            res.status(200).json({message: 'Media retrieved successfully', media});
        } catch (error) {
            next(error);
        }
    }

    async getAll(req: Request, res: Response, next: NextFunction) {
        try {
            const medias = await this.service.getAll();
            res.status(200).json({message: 'Medias retrieved successfully', medias});
        } catch (error) {
            next(error);
        }
    }

    async delete(req: Request, res: Response, next: NextFunction) {
        try {
            const {id} = req.params;

            if (!id){
                throw new BadRequest('id is required');
            }

            await this.service.delete(id);
            res.status(200).json({message: 'Media deleted successfully'});
        } catch (error) {
            next(error);
        }
    }
}

export default new MediaController();
