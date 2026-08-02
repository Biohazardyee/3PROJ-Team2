import {PrismaDb} from "../../../config/database.js";

/**
 * Vrai si l'utilisateur est le propriétaire OU un collaborateur de la playlist.
 * Utilisé pour autoriser l'ajout/retrait d'éléments (pas la gestion des
 * collaborateurs ni le renommage/suppression, qui restent réservés au owner).
 */
export async function isPlaylistEditor(playlistId: string, userId: string): Promise<boolean> {
    const playlist = await PrismaDb.playlists.findUnique({
        where: {id: playlistId},
        select: {user_id: true},
    });

    if (!playlist) return false;
    if (playlist.user_id === userId) return true;

    const collaborator = await PrismaDb.playlistCollaborators.findUnique({
        where: {
            playlist_id_user_id: {
                playlist_id: playlistId,
                user_id: userId,
            },
        },
    });

    return !!collaborator;
}
