import { Request, Response, NextFunction } from 'express';
import { PrismaDb } from '../config/database.js';
import { BadRequest, Forbidden, NotFound } from '../utils/errors.js';
import { isPlaylistEditor } from '../modules/db/playlists/playlist.helper.js';

/**
 * Autorise le retrait d'un élément si l'utilisateur est propriétaire OU
 * collaborateur de la playlist (le nom du fichier est conservé pour limiter
 * le churn des imports, mais la logique couvre maintenant les deux cas).
 */
export async function checkPlaylistOwner(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
        const loggedUser = req.user;
        const playlistItemId: string = req.params.id;

        if (!loggedUser) throw new BadRequest("User not authenticated");
        if (!playlistItemId) throw new BadRequest("Item ID is required");

        const playlistItem = await PrismaDb.playlistItems.findUnique({
            where: { id: playlistItemId },
            select: { playlist_id: true }
        });

        if (!playlistItem) {
            throw new NotFound("Playlist item not found");
        }

        const isAdmin = loggedUser.role === 'ADMIN';
        const isEditor = await isPlaylistEditor(playlistItem.playlist_id, loggedUser.id);

        if (isEditor || isAdmin) {
            return next();
        }

        throw new Forbidden("Access denied: you can only modify your own or shared playlist items");

    } catch (err) {
        next(err);
    }
}