import {PrismaDb} from '../../../config/database.js';
import {NotFound, BadRequest} from '../../../utils/errors.js';
import {isEmptyString, isValidApiId} from '../../../utils/helpers.js';
import {MediaCreateDto, MediaResponseDto, MediaUpdateDto} from "../../../types/medias/media.dto.js";
import {Medias} from "../../../generated/prisma/browser.js";
import {mediaMapper} from "../../../mappers/medias/media.mapper.js";
import {Prisma} from "../../../generated/prisma/client.js";

export class MediaService {
    async create(data: MediaCreateDto) {

        if (isEmptyString(data.api_id)) {
            throw new BadRequest('API ID cannot be empty');
        }

        const exists: Medias | null = await PrismaDb.medias.findFirst({
            where: {
                api_id: data.api_id
            }
        });

        if (exists) {
            throw new BadRequest('Media with this API ID already exists');
        }

        const media: Medias = await PrismaDb.medias.create({
            data
        });

        return mediaMapper.toDto(media);
    }

    async getAll(): Promise<MediaResponseDto[]> {
        const medias: Medias[] = await PrismaDb.medias.findMany({
            orderBy: {
                created_at: 'desc'
            }
        });

        return mediaMapper.toDtoList(medias);
    }

    async getById(id: string): Promise<MediaResponseDto> {

        if (isEmptyString(id)) {
            throw new BadRequest('Media id cannot be empty');
        }

        const media: Medias | null = await PrismaDb.medias.findUnique({
            where: {
                id
            },
        });
        if (!media) {
            throw new NotFound('Media not found');
        }

        return mediaMapper.toDto(media);
    }

    async update(id: string, data: MediaUpdateDto): Promise<MediaResponseDto> {
        if (isEmptyString(id)) {
            throw new BadRequest('Media id is required');
        }

        const media: Medias | null = await PrismaDb.medias.findUnique({
            where: {
                id
            }
        });

        if (!media) {
            throw new NotFound('Media not found');
        }

        const updateData: Prisma.MediasUpdateInput = {};

        if (data.api_id !== undefined) {
            if (!isValidApiId(data.api_id)) {
                throw new BadRequest('Invalid api_id provided');
            }
            updateData.api_id = data.api_id;
        }

        const updateMedia: Medias = await PrismaDb.medias.update({
            where: {
                id
            },
            data: updateData
        })

        return mediaMapper.toDto(updateMedia);
    }

    async delete(id: string): Promise<MediaResponseDto> {

        if (isEmptyString(id)) {
            throw new BadRequest('Media id cannot be empty');
        }

        const media: Medias | null = await PrismaDb.medias.findUnique({
            where: {
                id
            }
        });

        if (!media) {
            throw new NotFound('Media not found');
        }

        const deletedMedia: Medias = await PrismaDb.medias.delete({
            where: {
                id
            }
        });

        return mediaMapper.toDto(deletedMedia);
    }
}
