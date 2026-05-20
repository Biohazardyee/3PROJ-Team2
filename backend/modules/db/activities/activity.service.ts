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
import {
  feedRankingService,
  UserContext,
} from "../activities/feed.ranking.service.js";
export class ActivityService {
  /**
   * Helper privé pour construire le contexte utilisateur requis par le Scoring Engine
   */
  private async buildUserContext(userId: string): Promise<UserContext> {
    if (!userId) return { userId: "" };

    const user = await PrismaDb.users.findUnique({
      where: { id: userId },
      select: { favorite_band: true },
    });

    const following = await PrismaDb.follows.findMany({
      where: { user_id: userId },
      select: { follow_user_id: true },
    });

    // On récupère les IDs des médias déjà évalués par l'utilisateur pour alimenter la pénalité de diversité
    const userReviews = await PrismaDb.reviews.findMany({
      where: { user_id: userId },
      select: { media_id: true },
    });

    return {
      userId,
      following: following.map((f) => f.follow_user_id),
      favoriteArtists: user?.favorite_band ? [user.favorite_band] : [],
      likedMediaIds: userReviews.map((r) => r.media_id),
    };
  }

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
          where: { id },
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
      orderBy: { created_at: "desc" },
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

  /**
   * FRIENDS FEED
   * Classe les activités de tes abonnements par pertinence sociale, fraîcheur et engagement
   */
  async getFriendsFeed(
    user_id: string,
    limit = 10,
    offset = 0,
  ): Promise<FeedItem[]> {
    const context = await this.buildUserContext(user_id);

    if (!context.following || context.following.length === 0) {
      return [];
    }

    const bufferLimit = Math.max(150, (offset + limit) * 3);

    const activities = await PrismaDb.activities.findMany({
      where: { user_id: { in: context.following } },
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
      take: bufferLimit,
      orderBy: { created_at: "desc" },
    });

    const scoredActivities = activities.map((act) => {
      const scoringPayload = {
        ...act.review,
        created_at: act.created_at,
        user_id: act.user_id,
        _count: act.review?._count,
        artist:
          (act.review?.media?.content as any)?.artist ||
          (act.media?.content as any)?.artist,
        media_id: act.review?.media_id || act.media_id,
      };

      return {
        act,
        score: feedRankingService.computeScore(
          scoringPayload,
          "friends",
          context,
        ),
      };
    });

    scoredActivities.sort((a, b) => b.score - a.score);

    return scoredActivities
      .slice(offset, offset + limit)
      .map(({ act }) => mapToFeedItem(act, "friends"));
  }

  /**
   * GLOBAL FEED
   * Met en avant les meilleures critiques du réseau global en évitant l'effet "plat" chronologique
   */
  async getGlobalFeed(
    limit = 10,
    offset = 0,
    current_user_id?: string,
  ): Promise<FeedItem[]> {
    const context = current_user_id
      ? await this.buildUserContext(current_user_id)
      : { userId: "" };

    const bufferLimit = Math.max(100, (offset + limit) * 3);

    const activities = await PrismaDb.activities.findMany({
      where: { action: "review_created" },
      include: {
        user: true,
        media: true,
        review: {
          include: {
            media: true,
            _count: { select: { comments: true, likes: true } },
            likes: current_user_id
              ? { where: { user_id: current_user_id } }
              : false,
          },
        },
      },
      take: bufferLimit,
      orderBy: { created_at: "desc" },
    });

    const scoredActivities = activities.map((act) => {
      const scoringPayload = {
        ...act.review,
        created_at: act.created_at,
        user_id: act.user_id,
        _count: act.review?._count,
        artist:
          (act.review?.media?.content as any)?.artist ||
          (act.media?.content as any)?.artist,
        media_id: act.review?.media_id || act.media_id,
      };

      return {
        act,
        score: feedRankingService.computeScore(
          scoringPayload,
          "global",
          context,
        ),
      };
    });

    scoredActivities.sort((a, b) => b.score - a.score);

    return scoredActivities
      .slice(offset, offset + limit)
      .map(({ act }) => mapToFeedItem(act, "global"));
  }

  /**
   * DISCOVERY FEED
   * Système de recommandation hybride basé sur les scores, sans aucun random, avec contrôle de diversité
   */
  async getDiscoveryFeed(
    user_id: string,
    limit = 10,
    offset = 0,
  ): Promise<FeedItem[]> {
    const context = await this.buildUserContext(user_id);

    const user = await PrismaDb.users.findUnique({
      where: { id: user_id },
      select: { favorite_band: true },
    });

    if (!user) throw new NotFound("User not found");

    const userReviews = await PrismaDb.reviews.findMany({
      where: { user_id: user_id },
      select: {
        rating: true,
        media: { select: { rating: true, content: true } },
      },
    });

    let rawAlbumsToProcess: Array<{
      albumName: string;
      artistName: string;
      image: any;
    }> = [];

    if (user.favorite_band) {
      try {
        const topAlbumsRes = await artistService.getTopAlbums({
          artist: user.favorite_band,
        } as any);

        const favAlbums = (topAlbumsRes.topalbums?.album || []).slice(0, 30);
        for (const alb of favAlbums) {
          rawAlbumsToProcess.push({
            albumName: alb.name,
            artistName: user.favorite_band,
            image: alb.image,
          });
        }

     
        if (typeof artistService.getSimilarArtists === "function") {
          const similarArtistsRes = await artistService.getSimilarArtists({
            artist: user.favorite_band,
          } as any);

          const similarArtists = (
            similarArtistsRes.similarartists?.artist || []
          ).slice(0, 10);

          await Promise.all(
            similarArtists.map(async (art: any) => {
              try {
                const res = await artistService.getTopAlbums({
                  artist: art.name,
                } as any);
                const albums = (res.topalbums?.album || []).slice(0, 5);
                for (const alb of albums) {
                  rawAlbumsToProcess.push({
                    albumName: alb.name,
                    artistName: art.name,
                    image: alb.image,
                  });
                }
              } catch (err) {
              }
            }),
          );
        }
      } catch (e) {
        console.error(
          "Erreur lors de la récupération des données de l'API externe",
          e,
        );
      }
    }

    if (rawAlbumsToProcess.length === 0) return [];

    const albumNames = rawAlbumsToProcess.map((a) => a.albumName);
    const mediasInDb = await PrismaDb.medias.findMany({
      where: {
        content: {
          path: ["name"],
          string_contains: "", 
        },
      },
    });

    // Helper de correspondance rapide en mémoire (évite le await dans le for)
    const getMediaStatsInMemory = (albumName: string, artistName: string) => {
      const userReview = userReviews.find((r) => {
        const content = r.media.content as any;
        return (
          content?.name?.toLowerCase() === albumName.toLowerCase() &&
          content?.artist?.toLowerCase() === artistName.toLowerCase()
        );
      });

      const mediaInDb = mediasInDb.find((m) => {
        const content = m.content as any;
        return content?.name?.toLowerCase() === albumName.toLowerCase();
      });

      return {
        exists: !!userReview,
        userRating: userReview ? userReview.rating : null,
        globalRating: mediaInDb ? mediaInDb.rating : 0,
      };
    };

    const allRecommendations: FeedItem[] = [];

    for (const [index, item] of rawAlbumsToProcess.entries()) {
      const stats = getMediaStatsInMemory(item.albumName, item.artistName);

      allRecommendations.push({
        id: `reco-discover-${item.artistName.replace(/\s+/g, "-")}-${item.albumName.replace(/\s+/g, "-")}-${index}`,
        type: "new_album",
        artist: item.artistName,
        album: item.albumName,
        cover: getImageUrl(item.image),
        created_at: new Date(),
        hasReviewed: stats.exists,
        userReviewRating: stats.userRating,
      });
    }

    const shuffledRecommendations = allRecommendations.sort(
      () => 0.5 - Math.random(),
    );

    return shuffledRecommendations.slice(offset, offset + limit);
  }
}

export const activityService = new ActivityService();
