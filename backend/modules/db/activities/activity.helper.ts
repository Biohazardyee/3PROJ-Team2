import { PrismaDb } from "../../../config/database.js";
import {
    ActivityWithRelationsDto,
    FeedItem
} from '../../../types/activities/activities.dto.js';

export const getImageUrl = (images: any[]) => {
    if (!images || !images.length) return 'https://via.placeholder.com/300';
    const img = images.find(i => i.size === 'extralarge') || images[images.length - 1];
    return img['#text'];
};

export const getAverageRating = async (mediaId: string): Promise<number> => {
    const aggregate = await PrismaDb.reviews.aggregate({
        where: { media_id: mediaId },
        _avg: { rating: true },
    });

    return aggregate._avg.rating ? Math.round(aggregate._avg.rating * 10) / 10 : 0;
}

export function mapToFeedItem(act: ActivityWithRelationsDto, feedType: string): FeedItem {
    return {
        type: 'review',
        id: act.id,
        review_id: act.review_id ?? undefined,
        media_id: act.media_id ?? undefined,
        artist: act.artist,
        album: act.album,
        cover: act.cover,
        user_id: act.user_id,
        user_name: act.user_name,
        likes_count: (act as any).likes_count ?? 0,
        comments_count: (act as any).comments_count ?? 0,
        isLiked: (act as any).isLiked ?? false,
        created_at: act.created_at,
        title: act.title ?? undefined,
        content: act.content ?? undefined,
        rating: act.rating ?? undefined,
    };
}