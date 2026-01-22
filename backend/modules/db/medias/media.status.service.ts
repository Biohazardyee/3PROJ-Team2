import {prisma} from '../../../config/database.js';
import {NotFound, BadRequest} from '../../../utils/errors.js';
import {isEmptyString} from "../../../utils/helpers.js";
import {isValidMediaStatus} from "./media.status.helper.js"
import {MediaStatus} from '../../../generated/prisma/enums.js';

export class MediaStatusService {

    async create(data: { user_id: string, media_id: string, status: MediaStatus }) {

        const {
            user_id, 
            media_id, 
            status
        } = data;

        if (isEmptyString(user_id)) {
            throw new BadRequest('user_id cannot be empty');
        }

        if (isEmptyString(media_id)) {
            throw new BadRequest('media_id cannot be empty');
        }

        if (!isValidMediaStatus(status)) {
            throw new BadRequest('Invalid media status');
        }

        const user = await prisma.user.findUnique({
            where: {
                id: user_id
            },
        });

        if (!user) {
            throw new BadRequest('User with this id does not exist');
        }

        const media = await prisma.media.findUnique({
            where: {
                id: media_id
            },
        });

        if (!media) {
            throw new BadRequest('Media with this id does not exist');
        }

        const alreadyHasStatus = await prisma.userMediaStatus.findUnique({
            where: {
                user_id_media_id: {
                    user_id, 
                    media_id
                },
            },
        });

        if (alreadyHasStatus) {
            throw new BadRequest(
                'User already has a status for this media. Use update instead'
            );
        }

        return prisma.userMediaStatus.create({
            data: {
                user_id,
                media_id,
                status,
            },
            select: {
                user_id: true,
                media_id: true,
                status: true,
                created_at: true,
            },
        });
    }

    async update(user_id: string, media_id: string, status: MediaStatus) {

        if (isEmptyString(user_id)) {
            throw new BadRequest('user_id cannot be empty');
        }

        if (isEmptyString(media_id)) {
            throw new BadRequest('media_id cannot be empty');
        }

        if (!isValidMediaStatus(status)) {
            throw new BadRequest('Invalid media status');
        }

        const mediaStatus = await prisma.userMediaStatus.findUnique({
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


        return prisma.userMediaStatus.update({
            where: {
                user_id_media_id: {
                    user_id, 
                    media_id
                },
            },
            data: {
                status
            },
            select: {
                user_id: true,
                media_id: true,
                status: true,
                created_at: true,
            },
        });
    }

    async getStatus(user_id: string, media_id: string) {

        if (isEmptyString(user_id)) {
            throw new BadRequest('user_id cannot be empty');
        }

        if (isEmptyString(media_id)) {
            throw new BadRequest('media_id cannot be empty');
        }

        const mediaStatus = await prisma.userMediaStatus.findUnique({
            where: {
                user_id_media_id: {
                    user_id, 
                    media_id
                },
            },
            select: {
                user_id: true,
                media_id: true,
                status: true,
                created_at: true,
            },
        });

        if (!mediaStatus) {
            throw new NotFound('Media status not found');
        }

        return mediaStatus;
    }

    async delete(user_id: string, media_id: string) {

        if (isEmptyString(user_id)) {
            throw new BadRequest('user_id cannot be empty');
        }

        if (isEmptyString(media_id)) {
            throw new BadRequest('media_id cannot be empty');
        }

        const mediaStatus = await prisma.userMediaStatus.findUnique({
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

        return prisma.userMediaStatus.delete({
            where: {
                user_id_media_id: {
                    user_id, 
                    media_id
                },
            },
        });
    }
}
