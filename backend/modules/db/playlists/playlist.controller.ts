import type {Request, Response, NextFunction} from "express";

import {Controller} from "../../controller.js";
import {BadRequest} from "../../../utils/errors.js";
import {PlaylistService} from "./playlist.service.js";
import {
    PlaylistAddDto,
    PlaylistCollaboratorDto,
    PlaylistResponseAddDto,
    PlaylistResponseDeleteDto,
    PlaylistResponseDto,
    PlaylistResponseUpdateDto,
    PlaylistUpdateDto,
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
                image_url: req.body.image_url,
            };

            if (
                !createData.name ||
                !createData.user_id ||
                createData.is_public === undefined
            ) {
                throw new BadRequest("Name, User_id and Is_Public are required");
            }

            const playlist: PlaylistResponseAddDto =
                await this.service.create(createData);

            res.status(201).json({
                message: "Playlist created successfully",
                playlist,
            });
        } catch (error) {
            next(error);
        }
    }

    async getPlaylistsByUserId(
        req: Request,
        res: Response,
        next: NextFunction,
    ): Promise<void> {
        try {
            if (!req.params.id) {
                throw new BadRequest("Missing required fields");
            }

            const requesterId: string | undefined = (req as any).user?.id;

            const playlists: PlaylistResponseDto[] =
                await this.service.getPlaylistsByUserId(req.params.id, requesterId);

            res.status(200).json({
                message: "Playlists retrieved successfully",
                playlists,
            });
        } catch (error) {
            next(error);
        }
    }

    async addCollaborator(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const playlistId: string = req.params.id;
            const requesterId: string = (req as any).user.id;
            const username: string = req.body.username;

            if (!playlistId || !username) {
                throw new BadRequest("Playlist id and username are required");
            }

            const collaborators: PlaylistCollaboratorDto[] = await this.service.addCollaborator(
                playlistId,
                requesterId,
                username,
            );

            res.status(200).json({
                message: "Collaborator added successfully",
                collaborators,
            });
        } catch (error) {
            next(error);
        }
    }

    async removeCollaborator(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const playlistId: string = req.params.id;
            const requesterId: string = (req as any).user.id;
            const targetUserId: string = req.params.user_id;

            if (!playlistId || !targetUserId) {
                throw new BadRequest("Playlist id and user id are required");
            }

            await this.service.removeCollaborator(playlistId, requesterId, targetUserId);

            res.status(200).json({message: "Collaborator removed successfully"});
        } catch (error) {
            next(error);
        }
    }

    async leaveCollaboration(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const playlistId: string = req.params.id;
            const userId: string = (req as any).user.id;

            if (!playlistId) {
                throw new BadRequest("Playlist id is required");
            }

            await this.service.leaveCollaboration(playlistId, userId);

            res.status(200).json({message: "Left the collaborative playlist successfully"});
        } catch (error) {
            next(error);
        }
    }

    async getCollaborators(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const playlistId: string = req.params.id;
            const requesterId: string = (req as any).user.id;

            if (!playlistId) {
                throw new BadRequest("Playlist id is required");
            }

            const collaborators: PlaylistCollaboratorDto[] = await this.service.getCollaborators(
                playlistId,
                requesterId,
            );

            res.status(200).json({collaborators});
        } catch (error) {
            next(error);
        }
    }

    async getAll(
        _req: Request,
        res: Response,
        next: NextFunction,
    ): Promise<void> {
        try {
            const playlists: PlaylistResponseDto[] = await this.service.getAll();
            res.status(200).json({
                message: "Playlists retrieved successfully",
                playlists,
            });
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
                throw new BadRequest("Missing required fields");
            }

            const playlist: PlaylistResponseDto = await this.service.getById(
                req.params.id,
            );
            res.status(200).json({
                message: "Playlist retrieved successfully",
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
                throw new BadRequest("Id is required");
            }

            const updateData: PlaylistUpdateDto = {};

            if (req.body.name !== undefined) {
                updateData.name = req.body.name;
            }

            if (req.body.is_public !== undefined) {
                updateData.is_public = req.body.is_public;
            }

            if (req.body.image_url !== undefined) {
                updateData.image_url = req.body.image_url;
            }

            if (Object.keys(updateData).length === 0) {
                throw new BadRequest("No fields provided");
            }

            const playlist: PlaylistResponseUpdateDto = await this.service.update(
                id,
                updateData,
            );

            res.status(201).json({
                message: "Playlist updated successfully",
                playlist,
            });
        } catch (err) {
            next(err);
        }
    }

    async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            if (!req.params.id) {
                throw new BadRequest("Missing required fields");
            }

            const playlist: PlaylistResponseDeleteDto = await this.service.delete(
                req.params.id,
            );
            res.status(200).json({
                message: "Playlist deleted successfully",
                playlist,
            });
        } catch (error) {
            next(error);
        }
    }
}

export default new PlaylistController();
