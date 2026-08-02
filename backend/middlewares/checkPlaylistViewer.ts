import {Request, Response, NextFunction} from 'express';
import {PrismaDb} from '../config/database.js';
import {BadRequest, Forbidden, NotFound} from '../utils/errors.js';
import {isPlaylistEditor} from '../modules/db/playlists/playlist.helper.js';

/**
 * Autorise la lecture d'une playlist (GET /playlists/:id) si elle est
 * publique, ou si l'utilisateur en est le propriétaire, un collaborateur,
 * ou un admin. Contrairement à checkResourceOwnerOrAdmin, cette version
 * connaît la notion de collaborateur.
 */
export async function checkPlaylistViewer(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
        const loggedUser = req.user;
        const playlistId: string = req.params.id;

        if (!loggedUser) throw new BadRequest("User not authenticated");
        if (!playlistId) throw new BadRequest("Playlist ID is required");

        if (loggedUser.role === 'ADMIN') {
            return next();
        }

        const playlist = await PrismaDb.playlists.findUnique({
            where: {id: playlistId},
            select: {is_public: true},
        });

        if (!playlist) {
            throw new NotFound("Playlist not found");
        }

        if (playlist.is_public) {
            return next();
        }

        const allowed: boolean = await isPlaylistEditor(playlistId, loggedUser.id);

        if (!allowed) {
            throw new Forbidden("Access denied: this playlist is private");
        }

        next();
    } catch (err) {
        next(err);
    }
}
