import { PrismaDb } from '../../../config/database.js';
import { BadRequest, NotFound } from '../../../utils/errors.js';
import { isEmptyString } from '../../../utils/helpers.js';
import { Activities, Follows, Medias, Prisma, Reviews, Users } from '../../../generated/prisma/client.js';
import {
    ActivityAddDto,
    ActivityDeleteResponseDto,
    ActivityResponseDto,
    ActivityWithRelationsDto,
    FeedItem, FollowIdDto
} from '../../../types/activities/activities.dto.js';
import { activityMapper } from '../../../mappers/activities/activities.mapper.js';
import { artistService } from "../../external_api/artists/artist.service.js";
import { albumService } from "../../external_api/albums/album.service.js";
import { ReviewWithMediaDto } from "../../../types/reviews/review.dto.js";
import { reviewMapper } from "../../../mappers/reviews/review.mapper.js";
import Albums from "../../../routes/api/albums.js";
import { getAverageRating, getImageUrl, mapToFeedItem } from './activity.helper.js';



export class ActivityService {

    async create(data: ActivityAddDto): Promise<ActivityResponseDto> {


        if (isEmptyString(data.user_id)) {
            throw new BadRequest('The value of user_id cannot be empty');
        }

        if (!data.action) {
            throw new BadRequest('Invalid activity action');
        }

        const user: Users | null = await PrismaDb.users.findUnique({
            where: { id: data.user_id },
        });

        if (!user) {
            throw new BadRequest('User not found');
        }

        if (data.target_user_id) {
            if (data.target_user_id === data.user_id) {
                throw new BadRequest('target_user_id cannot be the same as user_id');
            }

            const targetUser: Users | null = await PrismaDb.users.findUnique({
                where: { id: data.target_user_id },
            });

            if (!targetUser) {
                throw new BadRequest('Target user not found');
            }
        }

        if (data.review_id) {
            const review: Reviews | null = await PrismaDb.reviews.findUnique({
                where: { id: data.review_id },
            });

            if (!review) {
                throw new BadRequest('Review not found');
            }
        }

        if (data.media_id) {
            const media: Medias | null = await PrismaDb.medias.findUnique({
                where: { id: data.media_id },
            });

            if (!media) {
                throw new BadRequest('Media not found');
            }
        }

        if (data.rating_from_user !== undefined && data.rating_from_user !== null) {
            if (data.rating_from_user < 0 || data.rating_from_user > 5) {
                throw new BadRequest('rating_from_user must be between 0 and 5');
            }
        }

        const createData: Prisma.ActivitiesUncheckedCreateInput = {
            user_id: data.user_id,
            action: data.action,
            target_user_id: data.target_user_id || null,
            review_id: data.review_id || null,
            media_id: data.media_id || null,
            rating_from_user: data.rating_from_user !== undefined ? data.rating_from_user : null,
        };

        const activity = await PrismaDb.activities.create({
            data: createData,
            include: {
                user: true,
                media: true,
                review: true
            }
        });

        return activityMapper.toActivityWithRelationsDto(activity as any);
    }


    async delete(id: string): Promise<ActivityDeleteResponseDto> {

        if (isEmptyString(id)) {
            throw new BadRequest('Activity id cannot be empty');
        }

        try {
            const activityToDelete: Activities | null = await PrismaDb.activities.delete(
                {
                    where: {
                        id
                    },
                })

            if (!activityToDelete) {
                throw new BadRequest('Activity not found');
            }


            return activityMapper.toDeleteDto(activityToDelete)
        } catch (error) {
            throw error;
        }
    }

    async getAll(): Promise<ActivityResponseDto[]> {

        const activities: Activities[] = await PrismaDb.activities.findMany({
            orderBy: {
                created_at: 'desc'
            }
        })

        return activityMapper.toDtoList(activities);
    }

    async getById(id: string): Promise<ActivityResponseDto> {

        if (isEmptyString(id)) {
            throw new BadRequest('Activity id cannot be empty');
        }

        const activity: Activities | null = await PrismaDb.activities.findUnique({
            where: { id },
        });

        if (!activity) {
            throw new NotFound('Activity not found');
        }

        return activityMapper.toDto(activity);
    }

    async getFriendsFeed(user_id: string, limit = 10, offset = 0): Promise<FeedItem[]> {
        const following = await PrismaDb.follows.findMany({
            where: { user_id },
            select: { follow_user_id: true }
        });

        // Correction de l'erreur "implicitly has any type" en typant l'argument f
        const friendIds: string[] = following.map((f: { follow_user_id: string }) => f.follow_user_id);

        const activities = await PrismaDb.activities.findMany({
            where: { user_id: { in: friendIds } },
            include: {
                user: true,
                media: true,
                review: {
                    include: {
                        _count: { select: { comments: true, likes: true } },
                        likes: { where: { user_id } }
                    }
                }
            },
            take: limit,
            skip: offset,
            orderBy: { created_at: 'desc' }
        });

        return activityMapper.toActivityWithRelationsDtoList(activities as any).map(act => mapToFeedItem(act, 'friends'));
    }

    async getGlobalFeed(limit = 10, offset = 0, current_user_id?: string): Promise<FeedItem[]> {
        const activities = await PrismaDb.activities.findMany({
            where: { action: 'review_created' },
            include: {
                user: true,
                media: true,
                review: {
                    include: {
                        _count: { select: { comments: true, likes: true } },
                        likes: current_user_id ? { where: { user_id: current_user_id } } : false
                    }
                }
            },
            take: limit,
            skip: offset,
            orderBy: { created_at: 'desc' }
        });

        return activityMapper.toActivityWithRelationsDtoList(activities as any).map(act => mapToFeedItem(act, 'global'));
    }


    async getDiscoveryFeed(user_id: string, limit = 10): Promise<FeedItem[]> {
        const user = await PrismaDb.users.findUnique({
            where: { id: user_id },
            select: { favorite_band: true }
        });

        if (!user) throw new NotFound('User not found');

        const rawReviews = await PrismaDb.reviews.findMany({
            where: { user_id, rating: { gte: 4 } },
            include: { media: true },
        });
        const likedReviews = reviewMapper.toReviewWithMediaDtoList(rawReviews);

        const favoriteBandRecommendations: FeedItem[] = [];

        if (user.favorite_band) {
            try {
                const topAlbums = await artistService.getTopAlbums({ artist: user.favorite_band });
                const albums = (topAlbums.topalbums?.album || []).slice(0, 5).map((album: any): FeedItem => ({
                    id: `reco-fav-${album.name}-${Date.now()}`, 
                    type: 'new_album',
                    artist: user.favorite_band!,
                    album: album.name,
                    cover: getImageUrl(album.image),
                    created_at: new Date(),
                }));
                favoriteBandRecommendations.push(...albums);
            } catch (e) { console.error("Discovery error:", e); }
        }

        const recommendedAlbumsPromises = likedReviews.map(async (review) => {
            const artist = (review.media?.content as any)?.album?.artist;
            if (!artist) return [];
            try {
                const top = await artistService.getTopAlbums({ artist });
                return (top.topalbums?.album || []).slice(0, 2).map((album: any): FeedItem => ({
                    id: `reco-like-${album.name}-${Math.random()}`, // ID unique
                    type: 'recommendation',
                    artist: artist,
                    album: album.name,
                    cover: getImageUrl(album.image),
                    created_at: new Date(),
                }));
            } catch { return []; }
        });

        const recommendedAlbums = await Promise.all(recommendedAlbumsPromises);

        const feedItems = [
            ...favoriteBandRecommendations,
            ...recommendedAlbums.flat()
        ];

        return feedItems.sort(() => 0.5 - Math.random()).slice(0, limit);
    }
}

export const activityService = new ActivityService();
