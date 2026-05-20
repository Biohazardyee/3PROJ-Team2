import { PrismaDb } from "../../../config/database.js";


export interface UserContext {
  userId: string;
  following?: string[]; 
  likedMediaIds?: string[]; 
  favoriteArtists?: string[]; 
}


interface ScoringFactors {
  engagement: number; // likes + comments
  freshness: number; // recency boost
  quality: number; // content length, rating, etc.
  social: number; // friend closeness
  diversity: number; // penalty si déjà vu
}

/**
 * Service de ranking centralisé pour les feeds
 * Applique une logique cohérente de scoring adaptée à chaque feed
 */
export class FeedRankingService {
  /**
   * Calcule le score global d'un item selon le type de feed
   * Les poids varient par feed type pour optimiser chaque contexte
   */
  computeScore(
    item: any,
    feedType: "global" | "friends" | "discovery",
    context: UserContext,
  ): number {
    const factors = this.computeFactors(item, context);

    const weights = {
      global: {
        engagement: 0.4,
        freshness: 0.3,
        quality: 0.2,
        social: 0.1,
        diversity: 0.0,
      },
      friends: {
        engagement: 0.2,
        freshness: 0.2,
        quality: 0.2,
        social: 0.4,
        diversity: 0.0,
      },
      discovery: {
        quality: 0.4,
        diversity: 0.3,
        freshness: 0.2,
        social: 0.1,
        engagement: 0.0,
      },
    }[feedType];

    return Object.entries(weights).reduce(
      (sum, [key, weight]) =>
        sum + factors[key as keyof ScoringFactors] * weight,
      0,
    );
  }

  /**
   * Calcule tous les facteurs de scoring pour un item
   */
  private computeFactors(item: any, context: UserContext): ScoringFactors {
    return {
      engagement: this.engagementScore(item),
      freshness: this.freshnessScore(item.created_at),
      quality: this.qualityScore(item),
      social: this.socialScore(item.user_id, context),
      diversity: this.diversityScore(item, context),
    };
  }

  /**
   * Score d'engagement : likes + comments
   * Max 100
   */
  private engagementScore(item: any): number {
    const likes = item._count?.likes || item.likes_count || 0;
    const comments = item._count?.comments || item.comments_count || 0;

    return Math.min(100, likes * 2 + comments * 3);
  }

  /**
   * Score de fraîcheur : décroît avec le temps
   * -2 points par heure
   * 0 après 50 heures
   */
  private freshnessScore(createdAt: Date | string): number {
    const date =
      typeof createdAt === "string" ? new Date(createdAt) : createdAt;
    const hoursAgo = (Date.now() - date.getTime()) / (1000 * 60 * 60);

    return Math.max(0, 100 - hoursAgo * 2);
  }

  /**
   * Score de qualité : pénalise contenu faible
   * Pour les reviews :
   *   - +50 si rating
   *   - +30 si contenu > 200 chars
   *   - +20 si title
   * Pour autres items : score minimal
   */
  private qualityScore(item: any): number {
    let score = 0;

    if (item.type === "review" || item.rating !== undefined) {
      if (item.rating !== null && item.rating !== undefined) score += 50;
      if ((item.content?.length || 0) > 200) score += 30;
      if (item.title) score += 20;
    }

    return Math.min(100, score);
  }

  /**
   * Score social : boost si follower
   * Peut être étendu avec interactions mutuelles
   */
  private socialScore(userId: string, context: UserContext): number {
    if (!userId) return 0;

    const isFollowing = context.following?.includes(userId);
    let score = 0;

    if (isFollowing) {
      score += 50;
    }


    return score;
  }

  /**
   * Score de diversité : pénalité si redondance
   * Pénalise si même artiste/utilisateur vu récemment
   */
  private diversityScore(item: any, context: UserContext): number {

    // Pénalité si on a déjà vu cet artiste
    if (item.artist && context.favoriteArtists?.includes(item.artist)) {
      return -15;
    }

    // Pénalité si déjà liké
    if (item.media_id && context.likedMediaIds?.includes(item.media_id)) {
      return -30;
    }

    return 0;
  }

  /**
   * Calcule le score de proximité d'un ami
   * Basé sur follows mutuels et interactions récentes
   */
  async computeFriendScore(friendId: string, userId: string): Promise<number> {
    let score = 0;

    const mutualFollows = await PrismaDb.follows.findUnique({
      where: {
        user_id_follow_user_id: {
          user_id: friendId,
          follow_user_id: userId,
        },
      },
    });

    if (mutualFollows) {
      score += 30;
    }

    const recentInteractions = await PrismaDb.reviewLikes.count({
      where: {
        user_id: userId,
        review: {
          user_id: friendId,
        },
        created_at: {
          gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), 
        },
      },
    });

    score += Math.min(20, recentInteractions * 2);

    return Math.min(100, score);
  }

  /**
   * Normalise les scores pour qu'ils soient entre 0 et 100
   */
  normalizeScore(score: number): number {
    return Math.max(0, Math.min(100, score));
  }
}

export const feedRankingService = new FeedRankingService();
