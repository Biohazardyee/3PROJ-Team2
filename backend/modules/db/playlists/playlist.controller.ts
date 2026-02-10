import type {Request, Response, NextFunction} from 'express';

import {Controller} from '../../controller.js';
import {BadRequest} from '../../../utils/errors.js';
import {PlaylistService} from './playlist.service.js';
import {
    PlaylistAddDto,
    PlaylistResponseAddDto, PlaylistResponseDeleteDto,
    PlaylistResponseDto, PlaylistResponseUpdateDto,
    PlaylistUpdateDto
} from "../../../types/playlists/playlist.dto.js";

class PlaylistController extends Controller {

    constructor(private readonly service = new PlaylistService()) {
        super();
    }

    async add(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const createData: PlaylistAddDto = {
                name: req.body.name,
                user_id: req.body.user_id,
                is_public: req.body.is_public,
            };

            if (!createData.name || !createData.user_id || !createData.is_public) {
                throw new BadRequest('Name, User_id and Is_Public are required');
            }

            const playlist: PlaylistResponseAddDto = await this.service.create(createData);

            res.status(201).json({
                message: 'Playlist created successfully',
                playlist,
            });
        } catch (error) {
            next(error);
        }
    }

    async getPlaylistsByUserId(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            if (!req.params.user_id) {
                throw new BadRequest('Missing required fields');
            }

            const playlists: PlaylistResponseDto[] = await this.service.getPlaylistsByUserId(req.params.user_id);

            res.status(200).json({
                message: 'Playlists retrieved successfully',
                playlists,
            });

        } catch (error) {
            next(error);
        }
    }

    async getAll(_req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const playlists: PlaylistResponseDto[] = await this.service.getAll();
            res.status(200).json({
                message: 'Playlists retrieved successfully',
                playlists,
            });
        } catch (error) {
            next(error);
        }
    }

    async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            if (!req.params.id) {
                throw new BadRequest('Missing required fields');
            }

            const playlist: PlaylistResponseDto = await this.service.getById(req.params.id);
            res.status(200).json({
                message: 'Playlist retrieved successfully',
                playlist,
            });
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

            const updateData: PlaylistUpdateDto = {};

            if (req.body.name !== undefined) {
                updateData.name = req.body.name;
            }

            if (req.body.is_public !== undefined) {
                updateData.is_public = req.body.is_public;
            }

            if (Object.keys(updateData).length === 0) {
                throw new BadRequest('No fields provided');
            }

            const playlist: PlaylistResponseUpdateDto = await this.service.update(id, updateData);

            res.status(201).json({
                message: 'Playlist updated successfully',
                playlist,
            });
        } catch (err) {
            next(err);
        }
    }

    async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            if (!req.params.id) {
                throw new BadRequest('Missing required fields');
            }

            const playlist: PlaylistResponseDeleteDto = await this.service.delete(req.params.id);
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