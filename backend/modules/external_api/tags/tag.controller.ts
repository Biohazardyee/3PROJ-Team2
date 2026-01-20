import { TagService } from "./tag.service.js";
import { Request, Response, NextFunction } from "express";
import { BadRequest } from "../../../utils/errors.js";

export class TagController {
    constructor(private readonly service = new TagService()) { }

    async getTagInfo(req: Request, res: Response, next: NextFunction) {
        try {
            const { tag } = req.query;

            if (!tag) {
                throw new BadRequest('Tag is required');
            }

            const tagInfo = await this.service.getTagInfo({
                tag: String(tag),
            });

            res.status(200).json({
                message: `${tag} info retrieved successfully`,
                tagInfo,
            });
        }
        catch (err) {
            next(err);
        }
    }

    async getTagTopArtists(req: Request, res: Response, next: NextFunction) {
        try {
            const { tag } = req.query;
            if (!tag) {
                throw new BadRequest('Tag is required');
            }
            const topArtists = await this.service.getTagTopArtists({
                tag: String(tag),
            });
            res.status(200).json({
                message: `Top artists for ${tag} retrieved successfully`,
                topArtists,
            });
        }
        catch (err) {
            next(err);
        }
    }

    async getTagTopAlbums(req: Request, res: Response, next: NextFunction) {
        try {
            const { tag } = req.query;
            if (!tag) {
                throw new BadRequest('Tag is required');
            }
            const topAlbums = await this.service.getTagTopAlbums({
                tag: String(tag),
            });
            res.status(200).json({
                message: `Top albums for ${tag} retrieved successfully`,
                topAlbums,
            });
        }
        catch (err) {
            next(err);
        }
    }

    async getTagTopTracks(req: Request, res: Response, next: NextFunction) {
        try {
            const { tag } = req.query;
            if (!tag) {
                throw new BadRequest('Tag is required');
            }
            const topTracks = await this.service.getTagTopTracks({
                tag: String(tag),
            });
            res.status(200).json({
                message: `Top tracks for ${tag} retrieved successfully`,
                topTracks,
            });
        }
        catch (err) {
            next(err);
        }
    }

    async getSimilarTags(req: Request, res: Response, next: NextFunction) {
        try {
            const { tag } = req.query;
            if (!tag) {
                throw new BadRequest('Tag is required');
            }
            const similarTags = await this.service.getSimilarTags({
                tag: String(tag),
            });
            res.status(200).json({
                message: `Tags similar to ${tag} retrieved successfully`,
                similarTags,
            });
        }
        catch (err) {
            next(err);
        }
    }
}

export default new TagController();