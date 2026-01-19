import {prisma} from '../../../config/database.js';
import {BadRequest, NotFound} from '../../../utils/errors.js';
import {isEmptyString} from '../../../utils/helpers.js';

export class PlaylistItemService {

    async add(data: {
        playlist_id: string;
        media_id: string
    }) {
        const {playlist_id, media_id} = data;

        if (isEmptyString(playlist_id)) {
            throw new BadRequest('playlist_id is required');
        }
        if (isEmptyString(media_id)) {
            throw new BadRequest('media_id is required');
        }

        // Check playlist exists
        const playlist = await prisma.playlist.findUnique({
            where: {
                id: playlist_id
            }
        });
        if (!playlist) {
            throw new NotFound('Playlist not found');
        }

        // Check media exists
        const media = await prisma.media.findUnique({
            where:
                {
                    id: media_id

                }
        });

        if (!media) {
            throw new NotFound('Media not found');
        }

        // Prevent duplicates
        const exists = await prisma.playlistItem.findFirst({
            where: {
                playlist_id,
                media_id
            },
        });
        if (exists) {
            throw new BadRequest('Media already in this playlist');
        }

        return prisma.playlistItem.create({
            data: {
                playlist_id,
                media_id
            },
            select: {
                id: true,
                playlist_id: true,
                media_id: true
            },
        });
    }

    async getByPlaylistId(playlist_id: string) {
        if (isEmptyString(playlist_id)) {
            throw new BadRequest('playlist_id is required');
        }

        const playlist = await prisma.playlist.findUnique({where: {id: playlist_id}});
        if (!playlist) {
            throw new NotFound('Playlist not found');
        }

        return prisma.playlistItem.findMany({
            where: {playlist_id},
            select: {
                id: true,
                media_id: true,
                media: {
                    select: {
                        id: true,
                        api_id: true
                    }
                },
            },
        });
    }

    async delete(id: string) {

        if (isEmptyString(id)) {
            throw new BadRequest('Playlist item id is required');
        }

        const item = await prisma.playlistItem.findUnique({where: {id}});

        if (!item) {
            throw new NotFound('Playlist item not found');
        }

        return prisma.playlistItem.delete({
            where: {id},
            select: {
                id: true,
                playlist_id: true,
                media_id: true
            },
        });
    }

    async getAll() {
        return prisma.playlistItem.findMany({
            select: {
                id: true,
                playlist_id: true,
                media_id: true
            },
        });
    }

    async getById(id: string) {
        if (isEmptyString(id)) {
            throw new BadRequest('Playlist item id is required');
        }

        const item = await prisma.playlistItem.findUnique({
            where: {id},
            select:
                {
                    id: true,
                    playlist_id: true,
                    media_id: true
                }
        });
        if (!item) {
            throw new NotFound('Playlist item not found');
        }

        return item;
    }
}

export const playlistItemService = new PlaylistItemService();
