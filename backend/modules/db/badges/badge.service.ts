import {PrismaDb} from "../../../config/database.js";
import {isEmptyString} from "../../../utils/helpers.js";
import {BadRequest} from "../../../utils/errors.js";
import {BADGES, BadgeCriteria, BadgeItem} from "./badge.catalog.js";
import {notificationService} from "../notifications/notification.service.js";
import {NotificationActions} from "../../../generated/prisma/enums.js";

export class BadgeService {
    getCatalog(): BadgeItem[] {
        return BADGES;
    }

    /**
     * Recalcule les compteurs live de l'utilisateur, débloque tout badge
     * nouvellement atteint, crédite les points boutique associés et notifie.
     * Conçu pour être appelé en fire-and-forget après une action pertinente
     * (review/comment/like/follow/playlist créés) — ne doit jamais faire
     * échouer l'action appelante.
     */
    async checkAndAwardBadges(userId: string): Promise<BadgeItem[]> {
        if (isEmptyString(userId)) return [];

        const user = await PrismaDb.users.findUnique({
            where: {id: userId},
            select: {earned_badges: true},
        });

        if (!user) return [];

        const [
            reviewsCount,
            followersCount,
            followingCount,
            commentsCount,
            playlistsCount,
            likesGivenCount,
        ] = await Promise.all([
            PrismaDb.reviews.count({where: {user_id: userId}}),
            PrismaDb.follows.count({where: {follow_user_id: userId}}),
            PrismaDb.follows.count({where: {user_id: userId}}),
            PrismaDb.reviewComments.count({where: {user_id: userId}}),
            PrismaDb.playlists.count({where: {user_id: userId}}),
            PrismaDb.reviewLikes.count({where: {user_id: userId}}),
        ]);

        const counts: Record<BadgeCriteria, number> = {
            reviews_count: reviewsCount,
            followers_count: followersCount,
            following_count: followingCount,
            comments_count: commentsCount,
            playlists_count: playlistsCount,
            likes_given_count: likesGivenCount,
        };

        const newlyEarned: BadgeItem[] = BADGES.filter(
            (badge): boolean =>
                !user.earned_badges.includes(badge.id) &&
                counts[badge.criteria] >= badge.threshold,
        );

        if (newlyEarned.length === 0) return [];

        const totalBonusPoints: number = newlyEarned.reduce(
            (sum, badge): number => sum + badge.reward_points,
            0,
        );

        await PrismaDb.users.update({
            where: {id: userId},
            data: {
                earned_badges: {push: newlyEarned.map((badge): string => badge.id)},
                shop_points: {increment: totalBonusPoints},
            },
        });

        for (const _badge of newlyEarned) {
            notificationService
                .create({user_id: userId, action: NotificationActions.badge_earned})
                .catch((err): void => console.error("Badge notification failed:", err));
        }

        return newlyEarned;
    }

    /**
     * Pour affichage profil : renvoie le catalogue complet enrichi du statut
     * (débloqué ou non) et de la progression actuelle de l'utilisateur.
     */
    async getUserBadgeProgress(userId: string): Promise<
        Array<BadgeItem & {unlocked: boolean; progress: number}>
    > {
        if (isEmptyString(userId)) {
            throw new BadRequest("User id is required");
        }

        const user = await PrismaDb.users.findUnique({
            where: {id: userId},
            select: {earned_badges: true},
        });

        if (!user) return [];

        const [
            reviewsCount,
            followersCount,
            followingCount,
            commentsCount,
            playlistsCount,
            likesGivenCount,
        ] = await Promise.all([
            PrismaDb.reviews.count({where: {user_id: userId}}),
            PrismaDb.follows.count({where: {follow_user_id: userId}}),
            PrismaDb.follows.count({where: {user_id: userId}}),
            PrismaDb.reviewComments.count({where: {user_id: userId}}),
            PrismaDb.playlists.count({where: {user_id: userId}}),
            PrismaDb.reviewLikes.count({where: {user_id: userId}}),
        ]);

        const counts: Record<BadgeCriteria, number> = {
            reviews_count: reviewsCount,
            followers_count: followersCount,
            following_count: followingCount,
            comments_count: commentsCount,
            playlists_count: playlistsCount,
            likes_given_count: likesGivenCount,
        };

        return BADGES.map((badge) => ({
            ...badge,
            unlocked: user.earned_badges.includes(badge.id),
            progress: Math.min(counts[badge.criteria], badge.threshold),
        }));
    }
}

export const badgeService = new BadgeService();
