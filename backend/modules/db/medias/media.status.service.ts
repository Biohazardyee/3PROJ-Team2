import {PrismaDb} from "../../../config/database.js";
import {NotFound, BadRequest} from "../../../utils/errors.js";
import {isEmptyString} from "../../../utils/helpers.js";
import {isValidMediaStatus} from "./media.status.helper.js";
import {MediaStatus} from "../../../generated/prisma/enums.js";
import {
    MediaStatusCreateDto,
    MediaStatusResponseDto,
    MediaStatusUpdateDto,
} from "../../../types/medias/media.status.dto.js";
import {
    Users,
    Medias,
    UserMediaStatus,
} from "../../../generated/prisma/browser.js";
import {mediaStatusMapper} from "../../../mappers/medias/media.status.mapper.js";

export class MediaStatusService {
    async create(data: MediaStatusCreateDto): Promise<MediaStatusResponseDto> {
        if (isEmptyString(data.user_id)) {
            throw new BadRequest("User_id cannot be empty");
        }

        if (isEmptyString(data.media_id)) {
            throw new BadRequest("Media_id cannot be empty");
        }

        if (!isValidMediaStatus(data.status)) {
            throw new BadRequest("Invalid media status");
        }

        const user: Users | null = await PrismaDb.users.findUnique({
            where: {
                id: data.user_id,
            },
        });

        if (!user) {
            throw new BadRequest("User with this id does not exist");
        }

        const media: Medias | null = await PrismaDb.medias.findUnique({
            where: {
                id: data.media_id,
            },
        });

        if (!media) {
            throw new BadRequest("Media with this id does not exist");
        }

        // Upsert : définir le statut, qu'il existe déjà ou non (évite une 400 inutile)
        const userMediaStatus: UserMediaStatus =
            await PrismaDb.userMediaStatus.upsert({
                where: {
                    user_id_media_id: {
                        user_id: data.user_id,
                        media_id: data.media_id,
                    },
                },
                update: {
                    status: data.status as MediaStatus,
                },
                create: data,
            });

        return mediaStatusMapper.toDto(userMediaStatus);
    }

    async getAll(): Promise<MediaStatusResponseDto[]> {
        const mediasStatus: UserMediaStatus[] =
            await PrismaDb.userMediaStatus.findMany({
                orderBy: {
                    created_at: "desc",
                },
            });

        return mediaStatusMapper.toDtoList(mediasStatus);
    }

    async getById(
        user_id: string,
        media_id: string,
    ): Promise<MediaStatusResponseDto> {
        try {
            const mediaStatus = await PrismaDb.userMediaStatus.findUnique({
                where: {
                    user_id_media_id: {user_id, media_id},
                },
                include: {
                    media: true,
                },
            });

            if (!mediaStatus) {
                return mediaStatusMapper.toDto({
                    user_id,
                    media_id,
                    status: "none",
                    created_at: new Date(),
                    media: null,
                });
            }

            return mediaStatusMapper.toDto(mediaStatus);
        } catch (error) {
            console.error("Erreur silencieuse MediaStatus:", error);
            return mediaStatusMapper.toDto({
                user_id,
                media_id,
                status: "none",
                created_at: new Date(),
                media: null,
            });
        }
    }

    async update(
        user_id: string,
        media_id: string,
        data: MediaStatusUpdateDto,
    ): Promise<MediaStatusResponseDto> {
        if (isEmptyString(user_id) || isEmptyString(media_id)) {
            throw new BadRequest("User_id and Media_id are required");
        }

        let media = await PrismaDb.medias.findUnique({
            where: {id: media_id},
        });

        if (!media) {
            media = await PrismaDb.medias.findUnique({
                where: {api_id: media_id},
            });
        }

        if (!media) {
            throw new BadRequest(
                "Le média doit d'abord être enregistré en base de données.",
            );
        }

        const mediaStatus = await PrismaDb.userMediaStatus.upsert({
            where: {
                user_id_media_id: {
                    user_id: user_id,
                    media_id: media.id,
                },
            },
            update: {
                status: data.status as MediaStatus,
            },
            create: {
                user_id: user_id,
                media_id: media.id,
                status: data.status as MediaStatus,
            },
        });
        return mediaStatusMapper.toDto(mediaStatus);
    }

    async getByUserId(user_id: string): Promise<MediaStatusResponseDto[]> {
        if (isEmptyString(user_id)) {
            throw new BadRequest("User_id cannot be empty");
        }

        const mediasStatus = await PrismaDb.userMediaStatus.findMany({
            where: {
                user_id: user_id,
            },
            include: {
                media: true,
            },
            orderBy: {
                created_at: "desc",
            },
        });

        return mediaStatusMapper.toDtoList(mediasStatus);
    }

    async delete(
        user_id: string,
        media_id: string,
    ): Promise<MediaStatusResponseDto> {
        if (isEmptyString(user_id)) {
            throw new BadRequest("User_id cannot be empty");
        }

        if (isEmptyString(media_id)) {
            throw new BadRequest("Media_id cannot be empty");
        }

        const mediaStatus: UserMediaStatus | null =
            await PrismaDb.userMediaStatus.findUnique({
                where: {
                    user_id_media_id: {
                        user_id,
                        media_id,
                    },
                },
            });

        if (!mediaStatus) {
            throw new NotFound("Media status not found");
        }

        const deleteMediaStatus: UserMediaStatus =
            await PrismaDb.userMediaStatus.delete({
                where: {
                    user_id_media_id: {
                        user_id,
                        media_id,
                    },
                },
            });

        return mediaStatusMapper.toDto(deleteMediaStatus);
    }
}
