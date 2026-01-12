import {prisma} from '../../config/database.js';
import {NotFound, BadRequest} from '../../utils/errors.js';

/**
 * Helpers
 */
function isNonEmptyString(value: any): boolean {
    return typeof value === 'string' && value.trim().length > 0;
}

const PLAYLIST_NAME_MAX_LENGTH = 100;

export class PlaylistService {

    async create(data: any) {
        const {name, user_id} = data;

        // ===== VALIDATION =====
        if (!isNonEmptyString(name)) {
            throw new BadRequest('Playlist name is required');
        }

        if (name.trim().length > PLAYLIST_NAME_MAX_LENGTH) {
            throw new BadRequest(
                `Playlist name is too long (max ${PLAYLIST_NAME_MAX_LENGTH} characters)`
            );
        }

        if (!isNonEmptyString(user_id)) {
            throw new BadRequest('user_id is required');
        }

        const cleanName = name.trim();

        // ===== USER EXISTS =====
        const user = await prisma.user.findUnique({
            where: {id: user_id},
        });

        if (!user) {
            throw new BadRequest('User with this id does not exist');
        }

        // ===== UNIQUE PLAYLIST NAME PER USER =====
        const exists = await prisma.playlist.findFirst({
            where: {
                user_id,
                name: cleanName,
            },
        });

        if (exists) {
            throw new BadRequest(
                'Playlist with this name already exists for the user'
            );
        }

        // ===== CREATE =====
        return prisma.playlist.create({
            data: {
                name: cleanName,
                user_id,
            },
            select: {
                id: true,
                name: true,
                created_at: true,
                user_id: true,
            },
        });
    }

    async getPlaylistsByUserId(user_id: string) {
        if (!isNonEmptyString(user_id)) {
            throw new BadRequest('user_id is required');
        }

        const playlists = await prisma.playlist.findMany({
            where: {user_id},
            select: {
                id: true,
                name: true,
                created_at: true,
                user_id: true,
            },
        });

        // findMany retourne toujours un tableau
        if (playlists.length === 0) {
            throw new NotFound('No playlists found for this user');
        }

        return playlists;
    }

    async getById(id: string) {
        if (!isNonEmptyString(id)) {
            throw new BadRequest('Playlist id is required');
        }

        const playlist = await prisma.playlist.findUnique({
            where: {id},
            select: {
                id: true,
                name: true,
                created_at: true,
                user_id: true,
            },
        });

        if (!playlist) {
            throw new NotFound('Playlist not found');
        }

        return playlist;
    }

    async update(playlistId: string, userId: string, data: { name?: string }) {
        if (!isNonEmptyString(playlistId)) {
            throw new BadRequest('playlistId is required');
        }

        if (!isNonEmptyString(userId)) {
            throw new BadRequest('userId is required');
        }

        // Champs modifiables uniquement
        const allowedFields = ['name'];

        for (const key of Object.keys(data)) {
            if (!allowedFields.includes(key)) {
                throw new BadRequest(`Field "${key}" cannot be updated`);
            }
        }

        if (data.name !== undefined) {
            if (!isNonEmptyString(data.name)) {
                throw new BadRequest('Playlist name cannot be empty');
            }

            if (data.name.trim().length > PLAYLIST_NAME_MAX_LENGTH) {
                throw new BadRequest(
                    `Playlist name is too long (max ${PLAYLIST_NAME_MAX_LENGTH} characters)`
                );
            }

            // Vérifier unicité du nom pour le user
            const exists = await prisma.playlist.findFirst({
                where: {
                    user_id: userId,
                    name: data.name.trim(),
                    NOT: {id: playlistId},
                },
            });

            if (exists) {
                throw new BadRequest(
                    'Playlist with this name already exists for the user'
                );
            }
        }

        try {
            return await prisma.playlist.update({
                where: {
                    id: playlistId,
                    user_id: userId, // autorisation ici
                },
                data: {
                    name: data.name?.trim(),
                },
                select: {
                    id: true,
                    name: true,
                    user_id: true,
                    created_at: true,
                    updated_at: true,
                },
            });
        } catch {
            throw new NotFound('Playlist not found or unauthorized');
        }
    }

    async getAll() {
        return prisma.playlist.findMany({
            select: {
                id: true,
                name: true,
                created_at: true,
                user_id: true,
            },
        });
    }

    async delete(id: string) {
        if (!isNonEmptyString(id)) {
            throw new BadRequest('Playlist id is required');
        }

        try {
            return await prisma.playlist.delete({
                where: {id},
                select: {
                    id: true,
                    name: true,
                    created_at: true,
                    user_id: true,
                },
            });
        } catch {
            throw new NotFound('Playlist not found');
        }
    }
}

export const playlistService = new PlaylistService();
