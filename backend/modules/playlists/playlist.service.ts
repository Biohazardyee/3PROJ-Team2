import { prisma } from '../../config/database.js';
import { NotFound, BadRequest } from '../../utils/errors.js';

export class PlaylistService {

    async create(data: any) {
        const exists = await prisma.playlist.findFirst({
            where: {
                name: data.name,
                user_id: data.user_id,
            },
        });

        if (exists) {
            throw new BadRequest('Playlist with this name already exists for the user');
        }

        return prisma.playlist.create({
            data,
            select: {
                id: true,
                name: true,
                created_at: true,
                user_id: true,
            },
        });
    }

    async getPlaylistsByUserId(user_id: string) {
        const playlists = prisma.playlist.findMany({
            where: { user_id },
            select: {
                id: true,
                name: true,
                created_at: true,
                user_id: true,
            },
        });

        if (!playlists) {
            throw new NotFound('No playlists found for this user');
        }

        return playlists;
    }

    async getById(id: string) {
        const playlist = await prisma.playlist.findUnique({
            where: { id },
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
        try {
            return await prisma.playlist.update({
                where: {
                    id: playlistId,
                    user_id: userId, // authorization enforced here
                },
                data,
                select: {
                    id: true,
                    name: true,
                    user_id: true,
                    created_at: true,
                    updated_at: true,
                },
            });
        } catch (error) {
            // Prisma throws if record not found
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
        try {
            return await prisma.playlist.delete({
                where: { id },
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