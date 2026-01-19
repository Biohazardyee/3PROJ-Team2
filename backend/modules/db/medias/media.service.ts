import {prisma} from '../../../config/database.js';
import {NotFound, BadRequest} from '../../../utils/errors.js';
import {isEmptyString, isValidApiId} from '../../../utils/helpers.js';

export class MediaService {
    async create(data: any) {
        const {api_id} = data;

        if (!isValidApiId(api_id)) {
            throw new BadRequest('Invalid api_id provided');
        }

        const exists = await prisma.media.findFirst(
            {
                where:
                    {api_id}
            });

        if (exists) {
            throw new BadRequest('Media with this API ID already exists');
        }

        return prisma.media.create({
            data: {
                api_id,
                created_at: new Date()
            },
            select: {
                id: true,
                api_id: true,
                created_at: true
            },
        });
    }

    async update(id: string, data: any) {
        if (isEmptyString(id)) {
            throw new BadRequest('Media id is required');
        }

        const media = await prisma.media.findUnique({where: {id}});

        if (!media) {
            throw new NotFound('Media not found');
        }

        const updateData: any = {};

        if (data.api_id !== undefined) {
            if (!isValidApiId(data.api_id)) {
                throw new BadRequest('Invalid api_id provided');
            }
            updateData.api_id = data.api_id;
        }

        return prisma.media.update({
            where: {id},
            data: updateData,
            select: {
                id: true,
                api_id: true,
                created_at: true
            },
        });
    }

    async getById(id: string) {

        if (isEmptyString(id)) {
            throw new BadRequest('Media id cannot be empty');
        }

        const media = await prisma.media.findUnique({
            where: {id},
            select: {
                id: true,
                api_id: true,
                created_at: true
            },
        });
        if (!media) {
            throw new NotFound('Media not found');
        }

        return media;
    }

    async getAll() {
        return prisma.media.findMany({
            select: {
                id: true,
                api_id: true,
                created_at: true
            },
        });
    }

    async delete(id: string) {

        if (isEmptyString(id)) {
            throw new BadRequest('Media id cannot be empty');
        }

        const media = await prisma.media.findUnique(
            {
                where: {id}
            });

        if (!media) {
            throw new NotFound('Media not found');
        }

        return prisma.media.delete({
            where: {id},
            select: {
                id: true,
                api_id: true,
                created_at: true
            },
        });
    }
}
