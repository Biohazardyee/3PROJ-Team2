import type {Request, Response, NextFunction} from 'express';

import {Controller} from '../../controller.js';
import {BadRequest} from '../../../utils/errors.js';
import {PlaylistService} from './playlist.service.js';

class PlaylistController extends Controller {

    constructor(private readonly service = new PlaylistService()) {
        super();
    }

    async add(req: Request, res: Response, next: NextFunction) {
        try {
            const {
                name,
                user_id,
                is_public,
            } = req.body;

            if (!name || !user_id) {
                throw new BadRequest('Missing required fields');
            }

            const playlist = await this.service.create({
                name,
                user_id,
                is_public,
                created_at: new Date(),
            });
            res.status(201).json({
                message: 'Playlist created successfully',
                playlist,
            });
        } catch (error) {
            next(error);
        }
    }

    async getPlaylistsByUserId(req: Request, res: Response, next: NextFunction) {
        try {
            const {
                user_id
            } = req.params;

            if (!user_id) {
                throw new BadRequest('Missing required fields');
            }

            const playlists = await this.service.getPlaylistsByUserId(user_id);

            res.status(200).json({
                message: 'Playlists retrieved successfully',
                playlists,
            });

        } catch (error) {
            next(error);
        }
    }

    async getAll(_req: Request, res: Response, next: NextFunction) {
        try {
            const playlists = await this.service.getAll();
            res.status(200).json({
                message: 'Playlists retrieved successfully',
                playlists,
            });
        } catch (error) {
            next(error);
        }
    }

    async getById(req: Request, res: Response, next: NextFunction) {
        try {
            const { id } = req.params;

            if (!id) {
                throw new BadRequest('Missing required fields');
            }

            const playlist = await this.service.getById(id);
            res.status(200).json({
                message: 'Playlist retrieved successfully',
                playlist,
            });
        } catch (error) {
            next(error);
        }
    }

    async update(req: Request, res: Response, next: NextFunction) {
        try {
            const { id } = req.params;

            if (!id){
                throw new BadRequest('Missing required fields');
            }

            const {
                name,
                is_public
            } = req.body;

            let data: any = {}

            if (name) {
                data.name = name;
            }

            if (is_public) {
                data.is_public = is_public;
            }

            if (Object.keys(data).length === 0) {
                throw new BadRequest("No fields provided")
            }

            const playlist = await this.service.update(id, data);

            res.status(200).json({
                message: 'Playlist updated successfully',
                playlist,
            });
        } catch (error) {
            next(error);
        }
    }

    async delete(req: Request, res: Response, next: NextFunction) {
        try {
            const {id} = req.params;

            if (!id) {
                throw new BadRequest('Missing required fields');
            }

            const playlist = await this.service.delete(id);
            res.status(200).json({
                message: 'Playlist deleted successfully',
                playlist,
            });
        } catch (error) {
            next(error);
        }
    }

}

export default new PlaylistController();