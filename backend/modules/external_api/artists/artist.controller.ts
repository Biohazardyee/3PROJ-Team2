import type {Request, Response, NextFunction} from 'express';
import {BadRequest} from '../../../utils/errors.js';
import {ArtistService, artistService} from './artist.service.js';

export class ArtistController {
    constructor(private readonly service: ArtistService = artistService) {

    }

    async getArtistInfo(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const {artist} = req.query;
            if (!artist) {
                throw new BadRequest('Artist is required');
            }
            const artistInfo: any = await this.service.getArtistInfo({
                artist: String(artist),
            });
            res.status(200).json({
                message: 'Artist info retrieved successfully',
                artistInfo,
            });
        } catch (err) {
            next(err);
        }
    }

    async getArtistbyId(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {

            const {mbid} = req.params;

            if (!mbid) {
                throw new BadRequest('MBID is required');
            }

            const artistInfo: any = await this.service.getArtistbyId({
                mbid: mbid,
            });

            res.status(200).json({
                message: 'Artist info retrieved successfully',
                artistInfo,
            });
        } catch (err) {
            next(err);
        }
    }

    async getTopAlbums(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const {artist} = req.query;
            if (!artist) {
                throw new BadRequest('Artist is required');
            }
            const topAlbums: any = await this.service.getTopAlbums({
                artist: String(artist),
            });
            res.status(200).json({
                message: 'Top albums retrieved successfully',
                topAlbums,
            });
        } catch (err) {
            next(err);
        }
    }

    async getArtistTopTags(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const {artist} = req.query;
            if (!artist) {
                throw new BadRequest('Artist is required');
            }
            const topTags: any = await this.service.getArtistTopTags({
                artist: String(artist),
            });

            res.status(200).json({
                message: 'Artist top tags retrieved successfully',
                topTags,
            });
        } catch (err) {
            next(err);
        }
    }

    async getArtistTopTracks(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const {artist} = req.query;

            if (!artist) {
                throw new BadRequest('Artist is required');
            }
            const topTracks: any = await this.service.getArtistTopTracks({
                artist: String(artist),
            });
            res.status(200).json({
                message: 'Artist top tracks retrieved successfully',
                topTracks,
            });
        } catch (err) {
            next(err);
        }
    }

    async getSimilarArtists(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const {mbid} = req.params;

            if (!mbid) {
                throw new BadRequest('MBID is required');
            }

            const similarArtists: any = await this.service.getSimilarArtists({
                mbid: mbid,
            });

            res.status(200).json({
                message: 'Similar artists retrieved successfully',
                similarArtists,
            });
        } catch (err) {
            next(err);
        }
    }
}

export const artistController = new ArtistController();