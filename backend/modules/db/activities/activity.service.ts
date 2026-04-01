import { PrismaDb } from "../../../config/database.js";
import { BadRequest, NotFound } from "../../../utils/errors.js";
import { isEmptyString } from "../../../utils/helpers.js";
import {
  Activities,
  Medias,
  Prisma,
  Reviews,
  Users,
} from "../../../generated/prisma/client.js";
import {
  ActivityAddDto,
  ActivityDeleteResponseDto,
  ActivityResponseDto,
  FeedItem,
} from "../../../types/activities/activities.dto.js";
import { activityMapper } from "../../../mappers/activities/activities.mapper.js";
import { artistService } from "../../external_api/artists/artist.service.js";
import { getImageUrl, mapToFeedItem } from "./activity.helper.js";

export class ActivityService {
  async create(data: ActivityAddDto): Promise<ActivityResponseDto> {
    if (isEmptyString(data.user_id)) {
      throw new BadRequest("The value of user_id cannot be empty");
    }

    if (!data.action) {
      throw new BadRequest("Invalid activity action");
    }

    const user: Users | null = await PrismaDb.users.findUnique({
      where: { id: data.user_id },
    });

    if (!user) {
      throw new BadRequest("User not found");
    }

    if (data.target_user_id) {
      if (data.target_user_id === data.user_id) {
        throw new BadRequest("target_user_id cannot be the same as user_id");
      }

      const targetUser: Users | null = await PrismaDb.users.findUnique({
        where: { id: data.target_user_id },
      });

      if (!targetUser) {
        throw new BadRequest("Target user not found");
      }
    }

    if (data.review_id) {
      const review: Reviews | null = await PrismaDb.reviews.findUnique({
        where: { id: data.review_id },
      });

      if (!review) {
        throw new BadRequest("Review not found");
      }
    }

    if (data.media_id) {
      const media: Medias | null = await PrismaDb.medias.findUnique({
        where: { id: data.media_id },
      });

      if (!media) {
        throw new BadRequest("Media not found");
      }
    }

    if (data.rating_from_user !== undefined && data.rating_from_user !== null) {
      if (data.rating_from_user < 0 || data.rating_from_user > 5) {
        throw new BadRequest("rating_from_user must be between 0 and 5");
      }
    }

    const createData: Prisma.ActivitiesUncheckedCreateInput = {
      user_id: data.user_id,
      action: data.action,
      target_user_id: data.target_user_id || null,
      review_id: data.review_id || null,
      media_id: data.media_id || null,
      rating_from_user:
        data.rating_from_user !== undefined ? data.rating_from_user : null,
    };

    const activity = await PrismaDb.activities.create({
      data: createData,
      include: {
        user: true,
        media: true,
        review: true,
      },
    });

    return activityMapper.toActivityWithRelationsDto(activity as any);
  }

  async delete(id: string): Promise<ActivityDeleteResponseDto> {
    if (isEmptyString(id)) {
      throw new BadRequest("Activity id cannot be empty");
    }

    try {
      const activityToDelete: Activities | null =
        await PrismaDb.activities.delete({
          where: {
            id,
          },
        });

      if (!activityToDelete) {
        throw new BadRequest("Activity not found");
      }

      return activityMapper.toDeleteDto(activityToDelete);
    } catch (error) {
      throw error;
    }
  }

  async getAll(): Promise<ActivityResponseDto[]> {
    const activities: Activities[] = await PrismaDb.activities.findMany({
      orderBy: {
        created_at: "desc",
      },
    });

    return activityMapper.toDtoList(activities);
  }

  async getById(id: string): Promise<ActivityResponseDto> {
    if (isEmptyString(id)) {
      throw new BadRequest("Activity id cannot be empty");
    }

    const activity: Activities | null = await PrismaDb.activities.findUnique({
      where: { id },
    });

    if (!activity) {
      throw new NotFound("Activity not found");
    }

    return activityMapper.toDto(activity);
  }

  async getFriendsFeed(
    user_id: string,
    limit = 10,
    offset = 0,
  ): Promise<FeedItem[]> {
    const following = await PrismaDb.follows.findMany({
      where: { user_id },
      select: { follow_user_id: true },
    });

    const friendIds: string[] = following.map(
      (f: { follow_user_id: string }) => f.follow_user_id,
    );

    const activities = await PrismaDb.activities.findMany({
      where: { user_id: { in: friendIds } },
      include: {
        user: true,
        media: true,
        review: {
          include: {
            media: true,
            user: true,
            _count: { select: { comments: true, likes: true } },
            likes: { where: { user_id } },
          },
        },
      },
      take: limit,
      skip: offset,
      orderBy: { created_at: "desc" },
    });

    return activities.map((act) => mapToFeedItem(act, "friends"));
  }

  async getGlobalFeed(
    limit = 10,
    offset = 0,
    current_user_id?: string,
  ): Promise<FeedItem[]> {
    const activities = await PrismaDb.activities.findMany({
      where: { action: "review_created" },
      include: {
        user: true,
        media: true,
        review: {
          include: {
            _count: {
              select: { comments: true, likes: true },
            },
            likes: current_user_id
              ? { where: { user_id: current_user_id } }
              : false,
          },
        },
      },
      take: limit,
      skip: offset,
      orderBy: { created_at: "desc" },
    });

    return activities.map((act) => mapToFeedItem(act, "global"));
  }

  async getDiscoveryFeed(user_id: string, limit = 50): Promise<FeedItem[]> {
    const user = await PrismaDb.users.findUnique({
      where: { id: user_id },
      select: { favorite_band: true },
    });

    if (!user) throw new NotFound("User not found");

    const userReviews = await PrismaDb.reviews.findMany({
      where: { user_id: user_id },
      select: {
        rating: true,
        media: {
          select: {
            rating: true,
            content: true,
          },
        },
      },
    });

    const getReviewInfo = (albumName: string, artistName: string) => {
      const review = userReviews.find((r) => {
        const content = r.media.content as any;
        return (
          content?.name?.toLowerCase() === albumName.toLowerCase() &&
          content?.artist?.toLowerCase() === artistName.toLowerCase()
        );
      });

      return {
        exists: !!review,
        userRating: review ? review.rating : null,
        globalRating: review ? review.media.rating : null,
      };
    };

    const getMediaStats = async (albumName: string, artistName: string) => {
      // 1. On cherche d'abord si l'utilisateur a une review (pour sa note perso)
      const userReview = userReviews.find((r) => {
        const content = r.media.content as any;
        return (
          content?.name?.toLowerCase() === albumName.toLowerCase() &&
          content?.artist?.toLowerCase() === artistName.toLowerCase()
        );
      });

      const mediaInDb = await PrismaDb.medias.findFirst({
        where: {
          content: {
            path: ["name"],
            equals: albumName,
          },
        },
      });

      return {
        exists: !!userReview,
        userRating: userReview ? userReview.rating : null,
        globalRating: mediaInDb ? mediaInDb.rating : 0,
        media_id: mediaInDb ? mediaInDb.id : undefined,
      };
    };

    const favoriteBandRecommendations: FeedItem[] = [];
    const similarArtistsRecommendations: FeedItem[] = [];

    if (user.favorite_band) {
      try {
        const topAlbumsRes = await artistService.getTopAlbums({
          artist: user.favorite_band,
        } as any);

        const favAlbumsRaw = (topAlbumsRes.topalbums?.album || []).slice(0, 20);

        for (const album of favAlbumsRaw) {
          const stats = await getMediaStats(album.name, user.favorite_band!);

          favoriteBandRecommendations.push({
            id: `reco-fav-${album.name}-${Date.now()}`,
            type: "new_album",
            artist: user.favorite_band!,
            album: album.name,
            cover: getImageUrl(album.image),
            created_at: new Date(),
            hasReviewed: stats.exists,
            userReviewRating: stats.userRating,
            globalRating: stats.globalRating,
            media_id: stats.media_id,
          });
        }

        const similarRes = await artistService.getSimilarArtists({
          artist: user.favorite_band,
        });

        const similarArtists = (similarRes.similarartists?.artist || []).slice(
          0,
          20,
        );

        const similarResults = await Promise.all(
          similarArtists.map(async (simArtist: any) => {
            try {
              const topSim = await artistService.getTopAlbums({
                artist: simArtist.name,
              });

              const albums = (topSim.topalbums?.album || []).slice(0, 3);

              // ON UTILISE getMediaStats ICI AUSSI
              return await Promise.all(
                albums.map(async (album: any): Promise<FeedItem> => {
                  const stats = await getMediaStats(album.name, simArtist.name);

                  return {
                    id: `reco-sim-${album.name}-${Math.random()}`,
                    type: "recommendation",
                    artist: simArtist.name,
                    album: album.name,
                    cover: getImageUrl(album.image),
                    created_at: new Date(),
                    hasReviewed: stats.exists,
                    userReviewRating: stats.userRating,
                    globalRating: stats.globalRating || 0,
                    media_id: stats.media_id,
                  };
                }),
              );
            } catch {
              return [];
            }
          }),
        );
        similarArtistsRecommendations.push(...similarResults.flat());
      } catch (e) {
        console.error("Discovery error:", e);
      }
    }

    const feedItems = [
      ...favoriteBandRecommendations,
      ...similarArtistsRecommendations,
    ];
    return feedItems.sort(() => Math.random() - 0.5).slice(0, limit);
  }
}

export const activityService = new ActivityService();
