import {Request, Response, NextFunction} from 'express';
import {BadRequest, Forbidden, NotFound} from '../utils/errors.js';
import {PrismaDb} from '../config/database.js';
import {isPlaylistEditor} from '../modules/db/playlists/playlist.helper.js';

/**
 * Autorise l'ajout d'un élément à une playlist si l'utilisateur en est le
 * propriétaire OU un collaborateur (contrairement à checkPlaylistOwner, qui
 * ne s'applique qu'aux actions réservées au propriétaire).
 */
export async function checkPlaylistEditor(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
        const loggedUser = req.user;
        const playlistId: string = req.body.playlist_id;

        if (!loggedUser) throw new BadRequest("User not authenticated");
        if (!playlistId) throw new BadRequest("playlist_id is required");

        if (loggedUser.role === 'ADMIN') {
            return next();
        }

        const playlist = await PrismaDb.playlists.findUnique({
            where: {id: playlistId},
            select: {id: true},
        });

        if (!playlist) {
            throw new NotFound("Playlist not found");
        }

        const allowed: boolean = await isPlaylistEditor(playlistId, loggedUser.id);

        if (!allowed) {
            throw new Forbidden("Access denied: you can only add items to your own or shared playlists");
        }

        next();
    } catch (err) {
        next(err);
    }
}
