import { TrackService } from "./track.service.js";
import { Request, Response, NextFunction } from 'express';
import { BadRequest } from '../../../utils/errors.js';

export class TrackController {
    constructor(private readonly service = new TrackService()) {
    }

    async getTrackInfo(req: Request, res: Response, next: NextFunction) {
        try {
            const { artist, track } = req.query;

            if (!artist || !track) {
                throw new BadRequest('Artist and Track are required');
            }

            const trackInfo = await this.service.getTrackInfo({
                artist: String(artist),
                track: String(track),
            });

            res.status(200).json({
                message: 'Track info retrieved successfully',
                trackInfo,
            });
        }
        catch (err) {
            next(err);
        }
    }

    async getSimilarTracks(req: Request, res: Response, next: NextFunction) {
        try {

            const { artist, track } = req.query;

            if (!artist || !track) {
                throw new BadRequest('Artist and Track are required');
            }

            const similarTracks = await this.service.getSimilarTracks({
                artist: String(artist),
                track: String(track),
            });

            res.status(200).json({
                message: 'Similar tracks retrieved successfully',
                similarTracks,
            });
        } catch (err) {
            next(err);
        }
    }

    async getTopTrackTags(req: Request, res: Response, next: NextFunction) {
        try {
            const { artist, track } = req.query;

            if (!artist || !track) {
                throw new BadRequest('Artist and Track are required');
            }

            const topTrackTags = await this.service.getTopTrackTags({
                artist: String(artist),
                track: String(track),
            });

            res.status(200).json({
                message: 'Top track tags retrieved successfully',
                topTrackTags,
            });
        }
        catch (err) {
            next(err);
        }
    }
}

export const trackController = new TrackController();