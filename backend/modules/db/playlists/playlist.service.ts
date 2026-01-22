import {prisma} from '../../../config/database.js';
import {NotFound, BadRequest} from '../../../utils/errors.js';
import {isEmptyString, isValidStringLength} from "../../../utils/helpers.js";

export class PlaylistService {

    async create(data: {
        name: string,
        user_id: string,
        is_public: boolean
        created_at: Date,
    }) {

        if (isEmptyString(data.name)) {
            throw new BadRequest('Playlist name cannot be empty');
        }

        if (isValidStringLength(data.name.trim(), 100)) {
            throw new BadRequest(
                `Playlist name is too long (max 100 characters)`
            );
        }

        if (isEmptyString(data.user_id)) {
            throw new BadRequest('user_id cannot be empty');
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

        if (isEmptyString(user_id)) {
            throw new BadRequest('user_id cannot be empty');
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
        if (isEmptyString(id)) {
            throw new BadRequest('Playlist id cannot be empty');
        }

        const playlist = await prisma.playlist.findUnique({
            where: {
                id
            },
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

    async update(id: string, data: {
        name: string, 
        user_id: string, 
        is_public: boolean
    }) {

        if (isEmptyString(id)) {
            throw new BadRequest('ID cannot be empty');
        }

        const allowedFields = ['name', 'is_public'];

        for (const key of Object.keys(data)) {
            if (!allowedFields.includes(key)) {
                throw new BadRequest(`Field "${key}" cannot be updated`);
            }
        }

        if (data.name) {
            if (isEmptyString(data.name)) {
                throw new BadRequest('Playlist name cannot be empty');
            }

            if (isValidStringLength(data.name, 100)) {
                throw new BadRequest(
                    `Playlist name is too long (max ${100} characters)`
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
        if (isEmptyString(id)) {
            throw new BadRequest('Playlist id cannot be empty');
        }

        try {
            return await prisma.playlist.delete({
                where: {
                    id
                },
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
