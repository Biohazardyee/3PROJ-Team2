import {prisma} from '../../config/database.js';
import {NotFound, BadRequest} from '../../utils/errors.js';
import {isNonEmptyString, isValidStringLength} from "../../utils/helpers.js";

const PLAYLIST_NAME_MAX_LENGTH = 100;

export class PlaylistService {

    async create(data: any) {

        if (!isNonEmptyString(data.name)) {
            throw new BadRequest('Playlist name is required');
        }

        if (isValidStringLength(data.name.trim(), PLAYLIST_NAME_MAX_LENGTH)) {
            throw new BadRequest(
                `Playlist name is too long (max ${PLAYLIST_NAME_MAX_LENGTH} characters)`
            );
        }

        if (!isNonEmptyString(data.user_id)) {
            throw new BadRequest('user_id is required');
        }

        const user = await prisma.user.findUnique({
            where: {
                id: data.user_id
            },
        });

        if (!user) {
            throw new BadRequest('User with this id does not exist');
        }

        const cleanName = data.name.trim();

        const exists = await prisma.playlist.findFirst({
            where: {
                user_id: data.user_id,
                name: cleanName,
            },
        });

        if (exists) {
            throw new BadRequest(
                'Playlist with this name already exists for the user'
            );
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

        if (!isNonEmptyString(user_id)) {
            throw new BadRequest('user_id is required');
        }

        const user = await prisma.user.findUnique({
            where: {
                id: user_id
            },
        });

        if (!user) {
            throw new BadRequest('User with this id does not exist');
        }

        return prisma.playlist.findMany({
            where: {
                user_id
            },
            select: {
                id: true,
                name: true,
                is_public: true,
                created_at: true,
                user_id: true,
            },
        });
    }

    async getAll() {
        return prisma.playlist.findMany({
            select: {
                id: true,
                name: true,
                user_id: true,
                is_public: true,
                created_at: true,
            },
        });
    }

    async getById(id: string) {
        if (!isNonEmptyString(id)) {
            throw new BadRequest('Playlist id is required');
        }

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

    async update(id: string, data: any) {

        if (!isNonEmptyString(id)) {
            throw new BadRequest('ID is required');
        }

        const allowedFields = ['name', 'is_public'];

        for (const key of Object.keys(data)) {
            if (!allowedFields.includes(key)) {
                throw new BadRequest(`Field "${key}" cannot be updated`);
            }
        }

        if (data.name) {
            if (!isNonEmptyString(data.name)) {
                throw new BadRequest('Playlist name cannot be empty');
            }

            if (isValidStringLength(data.name, PLAYLIST_NAME_MAX_LENGTH)) {
                throw new BadRequest(
                    `Playlist name is too long (max ${PLAYLIST_NAME_MAX_LENGTH} characters)`
                );
            }

            const exists = await prisma.playlist.findFirst({
                where: {
                    name: data.name.trim(),
                    user_id: data.user_id,
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
                    id: id,
                },
                data: {
                    name: data.name?.trim(),
                    is_public: data.is_public,
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
