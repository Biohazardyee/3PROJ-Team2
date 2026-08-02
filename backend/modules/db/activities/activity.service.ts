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
import {
  getImageUrl,
  mapToFeedItem,
  DiscoveryCandidate,
  addDiscoveryCandidate,
  coverFromContent,
  discoveryReasonType,
} from "./activity.helper.js";
import { feedRankingService, UserContext } from "./feed.ranking.service.js";

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

    const userReviews = await PrismaDb.reviews.findMany({
      where: { user_id: userId },
      select: { media_id: true },
    });

    return {
      userId,
      following: following.map((f): string => f.follow_user_id),
      favoriteArtists: user?.favorite_band ? [user.favorite_band] : [],
      likedMediaIds: userReviews.map((r): string => r.media_id),
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
    const context: UserContext = await this.buildUserContext(user_id);

    if (!context.following || context.following.length === 0) {
      return [];
    }

    const bufferLimit: number = Math.max(150, (offset + limit) * 3);

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

    scoredActivities.sort((a, b): number => b.score - a.score);

    return scoredActivities
      .slice(offset, offset + limit)
      .map(({ act }): FeedItem => mapToFeedItem(act, "friends"));
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
    const context: UserContext = current_user_id
      ? await this.buildUserContext(current_user_id)
      : { userId: "" };

    const bufferLimit: number = Math.max(100, (offset + limit) * 3);

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

    scoredActivities.sort((a, b): number => b.score - a.score);

    return scoredActivities
      .slice(offset, offset + limit)
      .map(({ act }): FeedItem => mapToFeedItem(act, "global"));
  }

  /**
   * DISCOVERY FEED
   * Recommandation hybride : filtrage par contenu (LastFM, artiste favori +
   * artistes similaires) combiné à du filtrage collaboratif (ce que des
   * utilisateurs aux goûts proches ont aimé), sans aucun random — le tri est
   * déterministe pour que la pagination (offset/limit) reste stable.
   */
  async getDiscoveryFeed(
    user_id: string,
    limit = 10,
    offset = 0,
  ): Promise<FeedItem[]> {
    const user = await PrismaDb.users.findUnique({
      where: { id: user_id },
      select: { favorite_band: true },
    });

    if (!user) throw new NotFound("User not found");

    const userReviews = await PrismaDb.reviews.findMany({
      where: { user_id },
      select: {
        media_id: true,
        rating: true,
        media: { select: { id: true, rating: true, content: true } },
      },
    });

    const knownMediaIds = new Set<string>(
      userReviews.map((r): string => r.media_id),
    );

    const statusRows = await PrismaDb.userMediaStatus.findMany({
      where: { user_id },
      select: { media_id: true },
    });
    statusRows.forEach((s): Set<string> => knownMediaIds.add(s.media_id));

    const candidates = new Map<string, DiscoveryCandidate>();

    const highlyRatedArtists: string[] = Array.from(
      new Set(
        userReviews
          .filter((r): boolean => r.rating >= 4)
          .map((r): string | undefined => (r.media.content as any)?.artist)
          .filter((a): a is string => !!a),
      ),
    ).slice(0, 3);

    const seedArtists: string[] = Array.from(
      new Set([
        ...(user.favorite_band ? [user.favorite_band] : []),
        ...highlyRatedArtists,
      ]),
    ).slice(0, 4);

    // --- Source A : filtrage par contenu (LastFM) ---
    for (const seedArtist of seedArtists) {
      try {
        const topAlbumsRes = await artistService.getTopAlbums({
          artist: seedArtist,
        } as any);

        const favAlbums = (topAlbumsRes.topalbums?.album || []).slice(0, 20);
        for (const alb of favAlbums) {
          addDiscoveryCandidate(candidates, {
            albumName: alb.name,
            artistName: seedArtist,
            cover: getImageUrl(alb.image),
            dbId: null,
            globalRating: 0,
            source: "favorite",
            closeness: 40,
            socialProofCount: 0,
          });
        }

        if (typeof artistService.getSimilarArtists === "function") {
          const similarArtistsRes = await artistService.getSimilarArtists({
            artist: seedArtist,
          } as any);

          const similarArtists = (
            similarArtistsRes.similarartists?.artist || []
          ).slice(0, 8);

          await Promise.all(
            similarArtists.map(async (art: any): Promise<void> => {
              try {
                const res = await artistService.getTopAlbums({
                  artist: art.name,
                } as any);
                const albums = (res.topalbums?.album || []).slice(0, 4);
                for (const alb of albums) {
                  addDiscoveryCandidate(candidates, {
                    albumName: alb.name,
                    artistName: art.name,
                    cover: getImageUrl(alb.image),
                    dbId: null,
                    globalRating: 0,
                    source: "similar",
                    closeness: 20,
                    socialProofCount: 0,
                  });
                }
              } catch (err) {}
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

    // --- Source B : filtrage collaboratif (goûts des utilisateurs proches) ---
    const likedMediaIds: string[] = userReviews
      .filter((r): boolean => r.rating >= 4)
      .map((r): string => r.media_id);

    if (likedMediaIds.length > 0) {
      const tasteNeighbors = await PrismaDb.reviews.findMany({
        where: {
          media_id: { in: likedMediaIds },
          rating: { gte: 4 },
          user_id: { not: user_id },
        },
        select: { user_id: true },
        distinct: ["user_id"],
        orderBy: { rating: "desc" },
        take: 50,
      });

      const neighborIds: string[] = tasteNeighbors.map((n): string => n.user_id);

      if (neighborIds.length > 0) {
        const neighborReviews = await PrismaDb.reviews.findMany({
          where: {
            user_id: { in: neighborIds },
            rating: { gte: 4 },
            media_id: { notIn: Array.from(knownMediaIds) },
          },
          select: {
            media_id: true,
            media: { select: { id: true, rating: true, content: true } },
          },
          orderBy: { rating: "desc" },
          take: 300,
        });

        const popularity = new Map<string, { count: number; media: any }>();
        for (const r of neighborReviews) {
          const entry = popularity.get(r.media_id) || { count: 0, media: r.media };
          entry.count += 1;
          popularity.set(r.media_id, entry);
        }

        for (const [mediaId, { count, media }] of popularity) {
          const content = media?.content as any;
          if (!content?.artist || !content?.name) continue;

          addDiscoveryCandidate(candidates, {
            albumName: content.name,
            artistName: content.artist,
            cover: coverFromContent(content),
            dbId: mediaId,
            globalRating: media.rating || 0,
            source: "collaborative",
            closeness: Math.min(45, 25 + count * 3),
            socialProofCount: count,
          });
        }
      }
    }

    // --- Repli "cold start" : pas assez de données pour personnaliser ---
    if (candidates.size === 0) {
      const topRated = await PrismaDb.medias.findMany({
        where: {
          id: { notIn: Array.from(knownMediaIds) },
          rating: { not: null },
        },
        orderBy: { rating: "desc" },
        take: 60,
      });

      for (const m of topRated) {
        const content = m.content as any;
        if (!content?.artist || !content?.name) continue;

        addDiscoveryCandidate(candidates, {
          albumName: content.name,
          artistName: content.artist,
          cover: coverFromContent(content),
          dbId: m.id,
          globalRating: m.rating || 0,
          source: "collaborative",
          closeness: 10,
          socialProofCount: 0,
        });
      }
    }

    // Résout dbId/globalRating pour les candidats venus de LastFM (recherche
    // ciblée sur les artistes concernés, pas un scan de toute la table).
    const unresolvedArtists: string[] = Array.from(
      new Set(
        Array.from(candidates.values())
          .filter((c): boolean => !c.dbId)
          .map((c): string => c.artistName),
      ),
    );

    // `equals` + `mode: insensitive` sur un champ JSON génère du SQL invalide
    // pour jsonb (`~~* ` sans cast) selon le provider ; `string_contains` en
    // insensitive fonctionne, et le matching exact est de toute façon refait
    // en mémoire juste après (cf. `.find()` plus bas).
    const mediasInDb = unresolvedArtists.length > 0
      ? await PrismaDb.medias.findMany({
          where: {
            OR: unresolvedArtists.map((name) => ({
              content: { path: ["artist"], string_contains: name, mode: "insensitive" },
            })),
          },
        })
      : [];

    for (const candidate of candidates.values()) {
      if (candidate.dbId) continue;

      const match = mediasInDb.find((m): boolean => {
        const content = m.content as any;
        return (
          content?.name?.toLowerCase() === candidate.albumName.toLowerCase() &&
          content?.artist?.toLowerCase() === candidate.artistName.toLowerCase()
        );
      });

      if (match) {
        candidate.dbId = match.id;
        candidate.globalRating = match.rating || 0;
      }
    }

    // Exclut tout ce que l'utilisateur connaît déjà (critique ou statut posé)
    for (const [key, candidate] of candidates) {
      if (candidate.dbId && knownMediaIds.has(candidate.dbId)) {
        candidates.delete(key);
      }
    }

    // --- Score déterministe (closeness + qualité + preuve sociale) ---
    const scored = Array.from(candidates.values()).map((c) => ({
      candidate: c,
      score:
        c.closeness +
        Math.min(30, (c.globalRating || 0) * 6) +
        Math.min(15, c.socialProofCount * 2),
    }));

    scored.sort(
      (a, b): number => b.score - a.score || a.candidate.key.localeCompare(b.candidate.key),
    );

    // Diversité : au plus 2 albums par artiste dans le haut du classement,
    // le reste vient combler la liste ensuite plutôt que d'être perdu.
    const perArtistCount = new Map<string, number>();
    const diversified: typeof scored = [];
    const overflow: typeof scored = [];

    for (const item of scored) {
      const artistKey: string = item.candidate.artistName.toLowerCase();
      const n: number = perArtistCount.get(artistKey) || 0;

      if (n < 2) {
        diversified.push(item);
        perArtistCount.set(artistKey, n + 1);
      } else {
        overflow.push(item);
      }
    }

    const finalOrdered = [...diversified, ...overflow];

    const items: FeedItem[] = finalOrdered.map(({ candidate }): FeedItem => ({
      id: candidate.dbId || `reco-discover-${candidate.key}`,
      type: "new_album",
      artist: candidate.artistName,
      album: candidate.albumName,
      cover: candidate.cover,
      created_at: new Date(),
      hasReviewed: false,
      userReviewRating: null,
      globalRating: candidate.globalRating || 0,
      reasonType: discoveryReasonType(candidate),
    }));

    return items.slice(offset, offset + limit);
  }
}

export const activityService = new ActivityService();
