import { prisma } from '../../config/database.js';
import { MediaStatus } from '../../generated/prisma/enums.js';
import { NotFound, BadRequest } from '../../utils/errors.js';


export class MediaStatusService {

    async create(data: any) {
        const alreadyHasStatus = await prisma.userMediaStatus.findFirst({
            where: {
                user_id: data.user_id,
                media_id: data.media_id,
            },
        });
        if (alreadyHasStatus) {
            throw new BadRequest('User already has a status for this media. HINT: use update instead');
        }

        return prisma.userMediaStatus.create({
            data,
            select: {
                user: true,
                user_id: true,
                media_id: true,
                status: true,
                created_at: true,
            },
        });
    }

    async update(user_id: string, media_id: string, status: MediaStatus) {
        try {
            return await prisma.userMediaStatus.update({
                where: { user_id_media_id: { user_id, media_id } },
                data: { status },
                select: {
                    user_id: true,
                    media_id: true,
                    status: true,
                    created_at: true
                }
            });
        } catch {
            throw new NotFound('Media status not found');
        }
    }

    async getStatus(user_id: string, media_id: string) {
        const mediaStatus = await prisma.userMediaStatus.findUnique({
            where: { user_id_media_id: { user_id, media_id } },
            select: {
                user_id: true,
                media_id: true,
                status: true,
                created_at: true
            }
        });
        if (!mediaStatus) {
            throw new NotFound('Media status not found');
        }
        return mediaStatus;
    }

    async delete(user_id: string, media_id: string) {
        try {
            return await prisma.userMediaStatus.delete({
                where: { user_id_media_id: { user_id, media_id } },
            });
        } catch {
            throw new NotFound('Media status not found');

        }
    }
}