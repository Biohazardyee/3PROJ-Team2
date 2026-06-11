import type { Request, Response, NextFunction } from 'express';
import { BadRequest } from '../../../utils/errors.js';
import { AlbumService, albumService } from './album.service.js';

export class AlbumController {

    constructor(private readonly service: AlbumService = albumService) { }

    async getAlbumInfo(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { mbid, artist, album } = req.query;

            if (!mbid && (!artist || !album)) {
                throw new BadRequest('You must provide either mbid OR artist + album');
            }

            const albumInfo: any = await this.service.getAlbumInfo({
                mbid: mbid ? String(mbid) : "",
                artist: artist ? String(artist) : "",
                album: album ? String(album) : "",
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
            const { mbid } = req.params;

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

    async albumGetSimilar(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { artist, album } = req.query;

            if (!artist || !album) {
                throw new BadRequest('Artist and Album name are required to find similar content');
            }

            const similarAlbums = await this.service.getSimilarAlbums({
                artist: String(artist),
                album: String(album),
            });

            res.status(200).json({ message: 'Similar albums retrieved successfully', similarAlbums });
        } catch (error) {
            next(error);
        }
    }
}

export default new AlbumController();