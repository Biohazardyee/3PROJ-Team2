import type {Request, Response, NextFunction} from "express";
import {Controller} from "../../controller.js";
import {BadRequest} from "../../../utils/errors.js";
import {MediaService} from "./media.service.js";
import {isValidApiId} from "../../../utils/helpers.js";
import {
    MediaCreateDto,
    MediaResponseDto,
    MediaUpdateDto,
} from "../../../types/medias/media.dto.js";

class MediaController extends Controller {
    constructor(private readonly service = new MediaService()) {
        super();
    }

    async add(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const {api_id, content} = req.body;

            if (!api_id) {
                throw new BadRequest("API ID is required");
            }

            if (!isValidApiId(api_id)) {
                throw new BadRequest("api_id must be a valid string");
            }

            if (!content || !content.name || !content.artist) {
                throw new BadRequest("Content (with name and artist) is required");
            }

            const createData: MediaCreateDto = {
                api_id,
                content: {
                    name: content.name,
                    artist: content.artist,
                    cover: content.cover || null,
                    mbid: content.mbid || null,
                },
            };

            const media: MediaResponseDto = await this.service.create(createData);

            res.status(201).json({
                message: "Media created successfully",
                media,
            });
        } catch (error) {
            next(error);
        }
    }

    async getAll(_: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const medias: MediaResponseDto[] = await this.service.getAll();
            res
                .status(200)
                .json({message: "Medias retrieved successfully", medias});
        } catch (error) {
            next(error);
        }
    }

    async getById(
        req: Request,
        res: Response,
        next: NextFunction,
    ): Promise<void> {
        try {
            if (!req.params.id) {
                throw new BadRequest("Id is required");
            }
            const media: MediaResponseDto = await this.service.getById(req.params.id);
            res.status(200).json({
                message: "Media retrieved successfully",
                media,
            });
        } catch (error) {
            next(error);
        }
    }

    async getTrending(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const limit: number = req.query.limit ? parseInt(req.query.limit as string, 10) : 4;
            const medias: MediaResponseDto[] = await this.service.getTrending(limit);

            res.status(200).json({
                message: "Trending medias retrieved successfully",
                medias,
            });
        } catch (error) {
            next(error);
        }
    }

    async update(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const id: string = req.params.id;

            if (!id) {
                throw new BadRequest("Id is required");
            }
            const updateData: MediaUpdateDto = {};

            if (req.body.api_id !== undefined) {
                updateData.api_id = req.body.api_id;
            }

            const media: MediaResponseDto = await this.service.update(id, updateData);
            res.status(200).json({message: "Media updated successfully", media});
        } catch (error) {
            next(error);
        }
    }

    async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            if (!req.params.id) {
                throw new BadRequest("Id is required");
            }

            const media: MediaResponseDto = await this.service.delete(req.params.id);
            res.status(200).json({message: "Media deleted successfully", media});
        } catch (error) {
            next(error);
        }
    }
    async syncSearchResults(
        req: Request,
        res: Response,
        next: NextFunction,
    ): Promise<void> {
        try {
            const {albums} = req.body;

            if (!albums || !Array.isArray(albums)) {
                throw new BadRequest("A field 'albums' (array of objects) is required");
            }

            const syncedAlbums: MediaResponseDto[] = await this.service.syncSearchResults(albums);

            res.status(200).json({
                message: "Albums synchronized successfully",
                medias: syncedAlbums,
            });
        } catch (error) {
            next(error);
        }
    }
}

export default new MediaController();
