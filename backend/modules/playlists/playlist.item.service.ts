import { prisma } from '../../config/database.js';
import { BadRequest, NotFound } from '../../utils/errors.js';
import { isEmptyString } from '../../utils/helpers.js';

export class PlaylistItemService {

    async add(data: { playlist_id: string; media_id: string }) {

        if (isEmptyString(data.playlist_id)) {
            throw new BadRequest('playlist_id is required');
        }

        if (isEmptyString(data.media_id)) {
            throw new BadRequest('media_id is required');
        }

        // Check playlist exists
        const playlist = await prisma.playlist.findUnique({
            where: { id: data.playlist_id },
        });

        if (!playlist) {
            throw new BadRequest('Playlist does not exist');
        }

        // Check media exists
        const media = await prisma.media.findUnique({
            where: { id: data.media_id },
        });

        if (!media) {
            throw new BadRequest('Media does not exist');
        }

        // Prevent duplicates
        const exists = await prisma.playlistItem.findFirst({
            where: {
                playlist_id: data.playlist_id,
                media_id: data.media_id,
            },
        });

        if (exists) {
            throw new BadRequest('Media already in this playlist');
        }

        return prisma.playlistItem.create({
            data,
            select: {
                id: true,
                playlist_id: true,
                media_id: true,
            },
        });
    }

    async getByPlaylistId(playlist_id: string) {

        if (isEmptyString(playlist_id)) {
            throw new BadRequest('playlist_id is required');
        }

        const playlist = await prisma.playlist.findUnique({
            where: { id: playlist_id },
        });

        if (!playlist) {
            throw new NotFound('Playlist not found');
        }

        return prisma.playlistItem.findMany({
            where: { playlist_id },
            select: {
                id: true,
                media_id: true,
                media: {
                    select: {
                        id: true,
                        api_id: true,
                    },
                },
            },
        });
    }

    async delete(id: string) {

        if (isEmptyString(id)) {
            throw new BadRequest('Playlist item id is required');
        }

        try {
            return await prisma.playlistItem.delete({
                where: { id },
                select: {
                    id: true,
                    playlist_id: true,
                    media_id: true,
                },
            });
        } catch {
            throw new NotFound('Playlist item not found');
        }
    }

    async getAll() {
        return prisma.playlistItem.findMany({
            select: {
                id: true,
                playlist_id: true,
                media_id: true,
            },
        });
    }

    async getById(id: string) {
        if (isEmptyString(id)) {
            throw new BadRequest('Playlist item id is required');
        }
        const item = await prisma.playlistItem.findUnique({
            where: { id },
            select: {
                id: true,
                playlist_id: true,
                media_id: true,
            },
        });
        if (!item) {
            throw new NotFound('Playlist item not found');
        }
        return item;
    }
}

export const playlistItemService = new PlaylistItemService();
