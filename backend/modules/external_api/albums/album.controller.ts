import type {Request, Response, NextFunction} from 'express';
import {BadRequest} from '../../../utils/errors.js';
import {AlbumService, albumService} from './album.service.js';


export class AlbumController {

    constructor(private readonly service: AlbumService = albumService) {

    }

    async getAlbumInfo(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const {artist, album} = req.query;

            if (!artist || !album) {
                throw new BadRequest('Artist and Album are required');
            }

            const albumInfo = await this.service.getAlbumInfo({
                artist: String(artist),
                album: String(album),
            });

            res.status(200).json({
                message: 'Album info retrieved successfully',
                albumInfo,
            });
        } catch (err) {
            next(err);
        }
    }

    async getAlbumInfoById(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const {mbid} = req.params;

            if (!mbid) {
                throw new BadRequest('MBID is required');
            }

            const albumInfo = await this.service.getAlbumInfoById({
                mbid: mbid,
            });
            res.status(200).json({
                message: 'Album info retrieved successfully',
                albumInfo,
            });
        } catch (err) {
            next(err);
        }
    }


    async albumGetTags(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const {mbid} = req.params;

            if (!mbid) {
                throw new BadRequest('mbid is required');
            }

            const tags: any = await this.service.albumGetTags({
                mbid: String(mbid),
            });

            res.status(200).json({
                message: 'Album tags retrieved successfully',
                tags,
            });
        } catch (err) {
            next(err);
        }
    }
}

export default new AlbumController();