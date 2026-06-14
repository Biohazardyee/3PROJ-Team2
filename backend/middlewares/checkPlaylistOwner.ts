import { Request, Response, NextFunction } from 'express';
import { PrismaDb } from '../config/database.js';
import { BadRequest, Forbidden, NotFound } from '../utils/errors.js';

export async function checkPlaylistOwner(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
        const loggedUser = req.user;
        const playlistItemId: string = req.params.id;

        if (!loggedUser) throw new BadRequest("User not authenticated");
        if (!playlistItemId) throw new BadRequest("Item ID is required");

        const playlistItem = await PrismaDb.playlistItems.findUnique({
            where: { id: playlistItemId },
            include: {
                playlist: {
                    select: { user_id: true }
                }
            }
        });

        if (!playlistItem) {
            throw new NotFound("Playlist item not found");
        }

        const isOwner = playlistItem.playlist.user_id === loggedUser.id;
        const isAdmin = loggedUser.role === 'ADMIN';

        if (isOwner || isAdmin) {
            return next();
        }

        throw new Forbidden("Access denied: you can only modify your own playlist items");

    } catch (err) {
        next(err);
    }
}