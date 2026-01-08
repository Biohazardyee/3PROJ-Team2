import { prisma } from '../../config/database.js';
import { NotFound, BadRequest } from '../../utils/errors.js';

export class MediaService {

    async create(data: any) {
        const exists = await prisma.media.findFirst({
            where: {
                api_id: data.api_id,
            },
        });

        if (exists) {
            throw new BadRequest('Media with this API ID already exists');
        }

        return prisma.media.create({
            data,
            select: {
                id: true,
                api_id: true,
                created_at: true,
            },
        });
    }

    async getById(id: string) {
        const media = await prisma.media.findUnique({
            where: { id },
            select: {
                id: true,
                api_id: true,
                created_at: true,
            },
        });
        if (!media) {
            throw new NotFound('Media not found');
        }
        return media;
    }

    async getAll() {
        return await prisma.media.findMany({
            select: {
                id: true,
                api_id: true,
                created_at: true,
            },
        });

    }

    async update(id: string, data: any) {
        const media = await prisma.media.findUnique({
            where: { id },
        });

        if (!media) {
            throw new NotFound('Media not found');
        }

        return prisma.media.update({
            where: { id },
            data,
            select: {
                id: true,
                api_id: true,
                created_at: true,
            },
        });
    }

    async delete(id: string) {
        const media = await prisma.media.findUnique({
            where: { id },
        });
        if (!media) {
            throw new NotFound('Media not found');
        }

        return prisma.media.delete({
            where: { id },
            select: {
                id: true,
                api_id: true,
                created_at: true,
            },
        })
    }

}