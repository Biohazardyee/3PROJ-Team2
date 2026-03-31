import { PrismaDb } from "../../../config/database.js";
import { BadRequest, NotFound } from "../../../utils/errors.js";
import { isEmptyString } from "../../../utils/helpers.js";
import {
  Activities,
  Follows,
  Medias,
  Prisma,
  Reviews,
  Users,
} from "../../../generated/prisma/client.js";
import {
  ActivityAddDto,
  ActivityDeleteResponseDto,
  ActivityResponseDto,
  ActivityWithRelationsDto,
  FeedItem,
  FollowIdDto,
} from "../../../types/activities/activities.dto.js";
import { activityMapper } from "../../../mappers/activities/activities.mapper.js";
import { artistService } from "../../external_api/artists/artist.service.js";
import { albumService } from "../../external_api/albums/album.service.js";
import { ReviewWithMediaDto } from "../../../types/reviews/review.dto.js";
import { reviewMapper } from "../../../mappers/reviews/review.mapper.js";
import Albums from "../../../routes/api/albums.js";
import {
  getAverageRating,
  getImageUrl,
  mapToFeedItem,
} from "./activity.helper.js";

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
    // Augmenté ici
    const user = await PrismaDb.users.findUnique({
      where: { id: user_id },
      select: { favorite_band: true },
    });

    if (!user) throw new NotFound("User not found");

    const favoriteBandRecommendations: FeedItem[] = [];
    const similarArtistsRecommendations: FeedItem[] = [];

    if (user.favorite_band) {
      try {
        // On récupère largement plus pour avoir du choix
        const topAlbumsRes = await artistService.getTopAlbums({
          artist: user.favorite_band,
        } as any);

        // On prend jusqu'à 20 albums du groupe favori
        const favAlbums = (topAlbumsRes.topalbums?.album || [])
          .slice(0, 20)
          .map(
            (album: any): FeedItem => ({
              id: `reco-fav-${album.name}-${Date.now()}-${Math.random()}`,
              type: "new_album",
              artist: user.favorite_band!,
              album: album.name,
              cover: getImageUrl(album.image),
              created_at: new Date(),
            }),
          );
        favoriteBandRecommendations.push(...favAlbums);

        // On demande explicitement plus d'artistes similaires à l'API
        const similarRes = await artistService.getSimilarArtists({
          artist: user.favorite_band,
        });

        // On en prend 20 au lieu de 15
        const similarArtists = (similarRes.similarartists?.artist || []).slice(
          0,
          20,
        );

        const similarPromises = similarArtists.map(async (simArtist: any) => {
          try {
            const topSim = await artistService.getTopAlbums({
              artist: simArtist.name,
            });

            // On prend 3 albums par artiste similaire au lieu de 2
            return (topSim.topalbums?.album || []).slice(0, 3).map(
              (album: any): FeedItem => ({
                id: `reco-sim-${album.name}-${Math.random()}`,
                type: "recommendation",
                artist: simArtist.name,
                album: album.name,
                cover: getImageUrl(album.image),
                created_at: new Date(),
              }),
            );
          } catch {
            return [];
          }
        });

        const similarResults = await Promise.all(similarPromises);
        similarArtistsRecommendations.push(...similarResults.flat());
      } catch (e) {
        console.error("Discovery error:", e);
      }
    }

    const feedItems = [
      ...favoriteBandRecommendations,
      ...similarArtistsRecommendations,
    ];

    console.log(`Total items trouvés avant limit: ${feedItems.length}`); // Debug pour voir le volume réel

    // On trie et on applique la limite demandée
    return feedItems.sort(() => Math.random() - 0.5).slice(0, limit);
  }
}

export const activityService = new ActivityService();
