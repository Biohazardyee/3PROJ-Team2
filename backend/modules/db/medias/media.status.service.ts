import {PrismaDb} from '../../../config/database.js';
import {NotFound, BadRequest} from '../../../utils/errors.js';
import {isEmptyString} from "../../../utils/helpers.js";
import {isValidMediaStatus} from "./media.status.helper.js"
import {MediaStatus} from '../../../generated/prisma/enums.js';
import {
    MediaStatusCreateDto,
    MediaStatusResponseDto,
    MediaStatusUpdateDto
} from "../../../types/medias/media.status.dto.js";
import {Users, Medias, UserMediaStatus} from "../../../generated/prisma/browser.js";
import {mediaStatusMapper} from "../../../mappers/medias/media.status.mapper.js";

export class MediaStatusService {

    async create(data: MediaStatusCreateDto): Promise<MediaStatusResponseDto> {

        if (isEmptyString(data.user_id)) {
            throw new BadRequest('User_id cannot be empty');
        }

        if (isEmptyString(data.media_id)) {
            throw new BadRequest('Media_id cannot be empty');
        }

        if (!isValidMediaStatus(data.status)) {
            throw new BadRequest('Invalid media status');
        }

        const user: Users | null = await PrismaDb.users.findUnique({
            where: {
                id: data.user_id
            },
        });

        if (!user) {
            throw new BadRequest('User with this id does not exist');
        }

        const media: Medias | null = await PrismaDb.medias.findUnique({
            where: {
                id: data.media_id
            },
        });

        if (!media) {
            throw new BadRequest('Media with this id does not exist');
        }

        const alreadyHasStatus: UserMediaStatus | null = await PrismaDb.userMediaStatus.findUnique({
            where: {
                user_id_media_id: {
                    user_id: data.user_id,
                    media_id: data.media_id,
                },
            },
        });

        if (alreadyHasStatus) {
            throw new BadRequest(
                'User already has a status for this media. Use update instead'
            );
        }

        const userMediaStatus: UserMediaStatus = await PrismaDb.userMediaStatus.create({
            data
        });

        return mediaStatusMapper.toDto(userMediaStatus);
    }

    async getAll(): Promise<MediaStatusResponseDto[]> {
        const mediasStatus: UserMediaStatus[] = await PrismaDb.userMediaStatus.findMany({
            orderBy: {
                created_at: 'desc'
            }
        });

        return mediaStatusMapper.toDtoList(mediasStatus);
    }

    async getById(user_id: string, media_id: string): Promise<MediaStatusResponseDto> {

        if (isEmptyString(user_id)) {
            throw new BadRequest('User_id cannot be empty');
        }

        if (isEmptyString(media_id)) {
            throw new BadRequest('Media_id cannot be empty');
        }

        const mediaStatus: UserMediaStatus | null = await PrismaDb.userMediaStatus.findUnique({
            where: {
                user_id_media_id: {
                    user_id,
                    media_id,
                },
            },
        });
        if (!mediaStatus) {
            throw new NotFound('UserMediaStatus not found');
        }

        return mediaStatusMapper.toDto(mediaStatus);
    }

    async update(user_id: string, media_id: string, data: MediaStatusUpdateDto): Promise<MediaStatusResponseDto> {

        if (isEmptyString(user_id)) {
            throw new BadRequest('User_id cannot be empty');
        }

        if (isEmptyString(media_id)) {
            throw new BadRequest('Media_id cannot be empty');
        }

        if (!isValidMediaStatus(data.status)) {
            throw new BadRequest('Invalid media status');
        }

        const mediaStatus: UserMediaStatus | null = await PrismaDb.userMediaStatus.findUnique({
            where: {
                user_id_media_id: {
                    user_id, 
                    media_id
                },
            },
        });

        if (!mediaStatus) {
            throw new NotFound('Media status not found');
        }

        const updateMediaStatus: UserMediaStatus = await PrismaDb.userMediaStatus.update({
            where: {
                user_id_media_id: {
                    user_id,
                    media_id
                },
            },
            data,
        });

        return mediaStatusMapper.toDto(updateMediaStatus);
    }

    async delete(user_id: string, media_id: string): Promise<MediaStatusResponseDto> {

        if (isEmptyString(user_id)) {
            throw new BadRequest('User_id cannot be empty');
        }

        if (isEmptyString(media_id)) {
            throw new BadRequest('Media_id cannot be empty');
        }

        const mediaStatus: UserMediaStatus | null = await PrismaDb.userMediaStatus.findUnique({
            where: {
                user_id_media_id: {
                    user_id, 
                    media_id
                },
            },
        });

        if (!mediaStatus) {
            throw new NotFound('Media status not found');
        }

        const deleteMediaStatus: UserMediaStatus = await PrismaDb.userMediaStatus.delete({
            where: {
                user_id_media_id: {
                    user_id,
                    media_id
                },
            }
        });

        return mediaStatusMapper.toDto(deleteMediaStatus);
    }
}
