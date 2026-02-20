import type {Request, Response, NextFunction} from 'express';

import {Controller} from '../../controller.js';
import {BadRequest} from '../../../utils/errors.js';
import {PlaylistItemService, playlistItemService} from './playlist.item.service.js';
import {PlaylistItemCreateDto, PlaylistItemResponseDto} from "../../../types/playlists/playlist.item.dto.js";

class PlaylistItemController extends Controller {

    constructor(private readonly service: PlaylistItemService = playlistItemService) {
        super();
    }

    async add(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const createData: PlaylistItemCreateDto = {
                playlist_id: req.body.playlist_id,
                media_id: req.body.media_id
            };

            if (!createData.playlist_id || !createData.media_id) {
                throw new BadRequest('Playlist_id and Media_id are required');
            }

            const playlistItem: PlaylistItemResponseDto = await this.service.add(createData);

            res.status(201).json({message: 'Media added to playlist successfully', playlistItem});
        } catch (error) {
            next(error);
        }
    }

    async getAll(_: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const playlistItems: PlaylistItemResponseDto[] = await this.service.getAll();
            res.status(201).json({message: 'Playlist items retrieved successfully', playlistItems});
        } catch (error) {
            next(error);
        }
    }

    async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            if (!req.params.id) {
                throw new BadRequest("Item ID is required as a parameter");
            }

            const playlistItem: PlaylistItemResponseDto = await this.service.getById(req.params.id);
            res.status(200).json({message: 'Playlist item retrieved successfully', playlistItem});
        } catch (error) {
            next(error);
        }
    }

    async getByPlaylistId(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            if (!req.params.playlist_id) {
                throw new BadRequest('Playlist_id is required');
            }

            const playlistItems: PlaylistItemResponseDto[] = await this.service.getByPlaylistId(req.params.playlist_id);

            res.status(200).json({
                message: 'Playlist items retrieved successfully',
                playlistItems
            });
        } catch (error) {
            next(error);
        }
    }

    async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            if (!req.params.id) {
                throw new BadRequest("Item ID is required as a parameter");
            }

            const playlistItem: PlaylistItemResponseDto = await this.service.delete(req.params.id);

            res.status(200).json({message: 'Playlist item removed successfully', playlistItem});
        } catch (error) {
            next(error);
        }
    }

    async update(_req: Request, _res: Response, _next: NextFunction): Promise<void> {
        // Not implemented
    }
}

export default new PlaylistItemController();
