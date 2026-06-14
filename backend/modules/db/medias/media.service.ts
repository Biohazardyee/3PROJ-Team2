import {PrismaDb} from "../../../config/database.js";
import {NotFound, BadRequest} from "../../../utils/errors.js";
import {isEmptyString, isValidApiId} from "../../../utils/helpers.js";
import {
    MediaCreateDto,
    MediaResponseDto,
    MediaUpdateDto,
} from "../../../types/medias/media.dto.js";
import {Medias} from "../../../generated/prisma/browser.js";
import {mediaMapper} from "../../../mappers/medias/media.mapper.js";
import {Prisma} from "../../../generated/prisma/client.js";

export class MediaService {
    async create(data: MediaCreateDto): Promise<MediaResponseDto> {
        if (isEmptyString(data.api_id)) {
            throw new BadRequest("API ID cannot be empty");
        }

        const exists = await PrismaDb.medias.findFirst({
            where: {api_id: data.api_id},
        });

        if (exists) {
            throw new BadRequest("Media with this API ID already exists");
        }

        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 30);

        const media: Medias = await PrismaDb.medias.create({
            data: {
                api_id: data.api_id,
                content: data.content,
                expires_at: expiresAt,
            },
        });

        return mediaMapper.toDto(media);
    }

    async getAll(): Promise<MediaResponseDto[]> {
        const medias: Medias[] = await PrismaDb.medias.findMany({
            orderBy: {
                created_at: "desc",
            },
        });

        return mediaMapper.toDtoList(medias);
    }

    async getById(identifier: string): Promise<MediaResponseDto> {
        if (isEmptyString(identifier)) {
            throw new BadRequest("Identifier cannot be empty");
        }

        const media = await PrismaDb.medias.findFirst({
            where: {
                OR: [{id: identifier}, {api_id: identifier}],
            },
        });

        if (!media) {
            throw new NotFound("Media not found in local database");
        }

        const ratings = await PrismaDb.reviews.aggregate({
            where: {media_id: media.id},
            _avg: {rating: true},
        });

        const avgRating: number = ratings._avg?.rating || 0;

        return mediaMapper.toDto({
            ...media,
            rating: Math.round(avgRating * 10) / 10,
        } as any);
    }

    async update(id: string, data: MediaUpdateDto): Promise<MediaResponseDto> {
        if (isEmptyString(id)) {
            throw new BadRequest("Media id is required");
        }

        const media: Medias | null = await PrismaDb.medias.findUnique({
            where: {
                id,
            },
        });

        if (!media) {
            throw new NotFound("Media not found");
        }

        const updateData: Prisma.MediasUpdateInput = {};

        if (data.api_id !== undefined) {
            if (!isValidApiId(data.api_id)) {
                throw new BadRequest("Invalid api_id provided");
            }
            updateData.api_id = data.api_id;
        }

        const updateMedia: Medias = await PrismaDb.medias.update({
            where: {
                id,
            },
            data: updateData,
        });

        return mediaMapper.toDto(updateMedia);
    }

    async getTrending(limit: number = 4): Promise<MediaResponseDto[]> {
        const trendingGroups = await PrismaDb.reviews.groupBy({
            by: ["media_id"],
            _avg: {
                rating: true,
            },
            _count: {
                media_id: true,
            },
            orderBy: [
                {
                    _count: {
                        media_id: "desc",
                    },
                },
                {
                    _avg: {
                        rating: "desc",
                    },
                },
            ],
            take: limit,
        });

        if (trendingGroups.length === 0) {
            const latestMedias = await PrismaDb.medias.findMany({
                take: limit,
                orderBy: {created_at: "desc"},
            });

            const fallbackMedias = latestMedias.map((media) => ({
                ...media,
                rating: 0,
            }));

            return mediaMapper.toDtoList(fallbackMedias as any);
        }

        const mediaIds: string[] = trendingGroups.map((group): string => group.media_id);

        const medias = await PrismaDb.medias.findMany({
            where: {
                id: {in: mediaIds},
            },
        });

        const orderedMediasWithRatings = mediaIds
            .map((id: string) => {
                const media = medias.find((m): boolean => m.id === id);
                if (!media) return null;

                const groupData = trendingGroups.find((g): boolean => g.media_id === id);
                const avgRating: number = groupData?._avg?.rating || 0;

                return {
                    ...media,
                    rating: Math.round(avgRating * 10) / 10,
                };
            })
            .filter(Boolean);

        return mediaMapper.toDtoList(orderedMediasWithRatings as any);
    }

    async delete(id: string): Promise<MediaResponseDto> {
        if (isEmptyString(id)) {
            throw new BadRequest("Media id cannot be empty");
        }

        const media: Medias | null = await PrismaDb.medias.findUnique({
            where: {
                id,
            },
        });

        if (!media) {
            throw new NotFound("Media not found");
        }

        const deletedMedia: Medias = await PrismaDb.medias.delete({
            where: {
                id,
            },
        });

        return mediaMapper.toDto(deletedMedia);
    }

    async syncSearchResults(albums: any[]): Promise<MediaResponseDto[]> {
        if (!Array.isArray(albums) || albums.length === 0) {
            throw new BadRequest("'albums' array is required");
        }

        return await Promise.all(
            albums.map(async (album: any): Promise<MediaResponseDto> => {
                const {api_id, name, artist, cover, mbid} = album;

                const fallbackId = `album:${artist}:${name}`;
                const targetId = api_id || fallbackId;

                let media = await PrismaDb.medias.findFirst({
                    where: {
                        OR: [{api_id: targetId}, {api_id: fallbackId}],
                    },
                });

                if (!media) {
                    const expiresAt = new Date();
                    expiresAt.setDate(expiresAt.getDate() + 30);

                    media = await PrismaDb.medias.create({
                        data: {
                            api_id: targetId,
                            content: {name, artist, cover, mbid: mbid || null},
                            expires_at: expiresAt,
                        },
                    });
                }

                const ratings = await PrismaDb.reviews.aggregate({
                    where: {media_id: media.id},
                    _avg: {rating: true},
                });

                const avgRating: number = ratings._avg?.rating || 0;

                return mediaMapper.toDto({
                    ...media,
                    rating: Math.round(avgRating * 10) / 10,
                } as any);
            }),
        );
    }
}
