import type {Request, Response, NextFunction} from 'express';

import {Controller} from '../controller.js';
import {BadRequest} from '../../utils/errors.js';
import {playlistItemService} from './playlist.item.service.js';

class PlaylistItemController extends Controller {

    constructor(private readonly service = playlistItemService) {
        super();
    }

    async add(req: Request, res: Response, next: NextFunction) {
        try {
            const {playlist_id, media_id} = req.body;
            if (!playlist_id || !media_id) {
                throw new BadRequest('playlist_id and media_id are required');
            }

            const item = await this.service.add({playlist_id, media_id});

            res.status(201).json({message: 'Media added to playlist successfully', item});
        } catch (error) {
            next(error);
        }
    }

    async getByPlaylistId(req: Request, res: Response, next: NextFunction) {
        try {
            const {playlist_id} = req.params;

            if (!playlist_id) {
                throw new BadRequest('playlist_id is required');
            }

            const items = await this.service.getByPlaylistId(playlist_id);

            res.status(200).json({
                message: 'Playlist items retrieved successfully',
                items
            });
        } catch (error) {
            next(error);
        }
    }

    async delete(req: Request, res: Response, next: NextFunction) {
        try {
            const {id} = req.params;

            if (!id) {
                throw new BadRequest("Item ID is required as a parameter");
            }

            const item = await this.service.delete(id);

            res.status(200).json({message: 'Playlist item removed successfully', item});
        } catch (error) {
            next(error);
        }
    }

    async getAll(req: Request, res: Response, next: NextFunction) {
        try {
            const items = await this.service.getAll();
            res.status(200).json({message: 'Playlist items retrieved successfully', items});
        } catch (error) {
            next(error);
        }
    }

    async getById(req: Request, res: Response, next: NextFunction) {
        try {
            const {id} = req.params;

            if (!id) {
                throw new BadRequest("Item ID is required as a parameter");
            }

            const item = await this.service.getById(id);
            res.status(200).json({message: 'Playlist item retrieved successfully', item});
        } catch (error) {
            next(error);
        }
    }

    async update(_req: Request, _res: Response, _next: NextFunction) {
        // Not implemented
    }
}

export default new PlaylistItemController();
