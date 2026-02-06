import {PrismaDb} from '../../../config/database.js';
import {NotFound, BadRequest} from '../../../utils/errors.js';
import {isEmptyString, isValidApiId} from '../../../utils/helpers.js';

export class MediaService {
    async create(data: { api_id: string }) {
        const {
            api_id
        } = data;

        if (!isValidApiId(api_id)) {
            throw new BadRequest('Invalid api_id provided');
        }

        const exists = await PrismaDb.media.findFirst({
            where: {
                api_id
            }
        });

        if (exists) {
            throw new BadRequest('Media with this API ID already exists');
        }

        return PrismaDb.media.create({
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

    async update(id: string, data: { api_id: string }) {
        if (isEmptyString(id)) {
            throw new BadRequest('Media id is required');
        }

        const media = await PrismaDb.media.findUnique({where: {id}});

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

        return PrismaDb.media.update({
            where: {
                id
            },
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

        const media = await PrismaDb.media.findUnique({
            where: {
                id
            },
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
        return PrismaDb.media.findMany({
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

        const media = await PrismaDb.media.findUnique(
            {
                where: {
                    id
                }
            });

        if (!media) {
            throw new NotFound('Media not found');
        }

        return PrismaDb.media.delete({
            where: {
                id
            },
            select: {
                id: true,
                api_id: true,
                created_at: true
            },
        });
    }
}
