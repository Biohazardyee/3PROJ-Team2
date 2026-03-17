import {PrismaDb} from '../../../config/database.js';
import {BadRequest, NotFound} from '../../../utils/errors.js';
import {isEmptyString} from '../../../utils/helpers.js';
import {Activities, Follows, Medias, Prisma, Reviews, Users} from '../../../generated/prisma/client.js';
import {
    ActivityAddDto,
    ActivityDeleteResponseDto,
    ActivityResponseDto,
    ActivityWithRelationsDto,
    FeedItem, FollowIdDto
} from '../../../types/activities/activities.dto.js';
import {activityMapper} from '../../../mappers/activities/activities.mapper.js';
import {artistService} from "../../external_api/artists/artist.service.js";
import {albumService} from "../../external_api/albums/album.service.js";
import {ReviewWithMediaDto} from "../../../types/reviews/review.dto.js";
import {reviewMapper} from "../../../mappers/reviews/review.mapper.js";
import Albums from "../../../routes/api/albums";


export class ActivityService {

    async create(data: ActivityAddDto): Promise<ActivityResponseDto> {


        if (isEmptyString(data.user_id)) {
            throw new BadRequest('The value of user_id cannot be empty');
        }

        if (!data.action) {
            throw new BadRequest('Invalid activity action');
        }

        const user: Users | null = await PrismaDb.users.findUnique({
            where: {id: data.user_id},
        });

        if (!user) {
            throw new BadRequest('User not found');
        }

        if (data.target_user_id) {
            if (data.target_user_id === data.user_id) {
                throw new BadRequest('target_user_id cannot be the same as user_id');
            }

            const targetUser: Users | null = await PrismaDb.users.findUnique({
                where: {id: data.target_user_id},
            });

            if (!targetUser) {
                throw new BadRequest('Target user not found');
            }
        }

        if (data.review_id) {
            const review: Reviews | null = await PrismaDb.reviews.findUnique({
                where: {id: data.review_id},
            });

            if (!review) {
                throw new BadRequest('Review not found');
            }
        }

        if (data.media_id) {
            const media: Medias | null = await PrismaDb.medias.findUnique({
                where: {id: data.media_id},
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

        const activity: Activities = await PrismaDb.activities.create({
            data: createData,
        });

        return activityMapper.toDto(activity);
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
            where: {id},
        });

        if (!activity) {
            throw new NotFound('Activity not found');
        }

        return activityMapper.toDto(activity);
    }

    async getUserFeed(user_id: string, limit = 20, offset = 0): Promise<FeedItem[]> {
        if (isEmptyString(user_id)) {
            throw new BadRequest('User_id cannot be empty');
        }


        const [user, following] = await Promise.all([
            PrismaDb.users.findUnique({
                where: {id: user_id},
                select: {favorite_band: true},
            }),
            PrismaDb.follows.findMany({
                where: {user_id},
                select: {follow_user_id: true},
            }),
        ]);

        if (!user) throw new NotFound('User not found');
        const friendIds: string[] = following.map(f => f.follow_user_id);


        const rawActivities = await PrismaDb.activities.findMany({
            where: {user_id: {in: [user_id, ...friendIds]}},
            include: {user: true, review: true, media: true},
            orderBy: {created_at: 'desc'},
            take: limit,
            skip: offset,
        });
        const activities: ActivityWithRelationsDto[] = activityMapper.toActivityWithRelationsDtoList(rawActivities);


        const activityFeedItems: FeedItem[] = activities.map(activity => ({
            type: activity.action === 'review_created' ? 'review'
                : activity.action === 'rating_added' ? 'like'
                    : 'comment',
            user_id: activity.user_id,
            review_id: activity.review_id ?? undefined,
            media_id: activity.media_id ?? undefined,
            created_at: activity.created_at,
            content: activity.review?.content ?? undefined,
        }));


        const rawReviews = await PrismaDb.reviews.findMany({
            where: {user_id, rating: {gte: 4}},
            include: {media: true},
        });
        const likedReviews: ReviewWithMediaDto[] = reviewMapper.toReviewWithMediaDtoList(rawReviews);


        const favoriteBandRecommendations: FeedItem[] = [];
        if (user.favorite_band) {
            try {
                const topAlbums = await artistService.getTopAlbums({artist: user.favorite_band});
                const albums = (topAlbums.topalbums?.album || []).slice(0, 5).map((album: any): FeedItem => ({
                    type: 'new_album',
                    artist: user.favorite_band!,
                    album: album.name,
                    created_at: new Date(0),
                }));
                favoriteBandRecommendations.push(...albums);


                const artistInfo = await artistService.getArtistInfo({artist: user.favorite_band});
                const mbid = artistInfo?.artist?.mbid;
                if (mbid) {
                    const similar = await artistService.getSimilarArtists({mbid});
                    const similarAlbums = await Promise.all(
                        (similar.similarartists?.artist || []).slice(0, 5).map(async (similarArtist: any) => {
                            try {
                                const albums = await artistService.getTopAlbums({artist: similarArtist.name});
                                return (albums.topalbums?.album || []).slice(0, 2).map((album: any): FeedItem => ({
                                    type: 'recommendation',
                                    artist: similarArtist.name,
                                    album: album.name,
                                    created_at: new Date(0),
                                }));
                            } catch {
                                return [];
                            }
                        })
                    );
                    favoriteBandRecommendations.push(...similarAlbums.flat());
                }
            } catch {
                // Si l'API externe fail, on continue sans recos
            }
        }


        const recommendedAlbums = await Promise.all(
            likedReviews.map(async (review: ReviewWithMediaDto) => {
                const artist = (review.media?.content as any)?.album?.artist;
                if (!artist) return [];
                try {
                    const topAlbums = await artistService.getTopAlbums({artist});
                    return (topAlbums.topalbums?.album || []).slice(0, 3).map((album: any): FeedItem => ({
                        type: 'new_album',
                        artist: album.artist?.name ?? artist,
                        album: album.name,
                        created_at: new Date(0),
                    }));
                } catch {
                    return [];
                }
            })
        );


        const similarArtists = await Promise.all(
            likedReviews.map(async (review: ReviewWithMediaDto) => {
                const mbid = (review.media?.content as any)?.album?.artist_mbid
                    ?? (review.media?.content as any)?.album?.mbid;
                if (!mbid) return [];
                try {
                    const similar = await artistService.getSimilarArtists({mbid});
                    return similar.similarartists?.artist || [];
                } catch {
                    return [];
                }
            })
        );


        const similarArtistsAlbumRecommendations = await Promise.all(
            similarArtists.flat().map(async (artist: any) => {
                if (!artist?.name) return [];
                try {
                    const topAlbums = await artistService.getTopAlbums({artist: artist.name});
                    return (topAlbums.topalbums?.album || []).slice(0, 3).map((album: any): FeedItem => ({
                        type: 'recommendation',
                        artist: artist.name,
                        album: album.name,
                        created_at: new Date(0),
                    }));
                } catch {
                    return [];
                }
            })
        );


        const feedItems: FeedItem[] = [
            ...activityFeedItems,
            ...favoriteBandRecommendations,
            ...recommendedAlbums.flat(),
            ...similarArtistsAlbumRecommendations.flat(),
        ];

        feedItems.sort((a, b) => b.created_at.getTime() - a.created_at.getTime());

        return feedItems;
    }
}

export const activityService = new ActivityService();
