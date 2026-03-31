import { PrismaDb } from "../../../config/database.js";
import {
  ActivityWithRelationsDto,
  FeedItem,
} from "../../../types/activities/activities.dto.js";

export const getImageUrl = (images: any[]) => {
  if (!images || !images.length) return "https://via.placeholder.com/300";
  const img =
    images.find((i) => i.size === "extralarge") || images[images.length - 1];
  return img["#text"];
};

export const getAverageRating = async (mediaId: string): Promise<number> => {
  const aggregate = await PrismaDb.reviews.aggregate({
    where: { media_id: mediaId },
    _avg: { rating: true },
  });

  return aggregate._avg.rating
    ? Math.round(aggregate._avg.rating * 10) / 10
    : 0;
};

export const mapToFeedItem = (act: any, feedType: string): FeedItem => {
  const review = act.review;

  const media = act.media || review?.media;
  
  const externalContent = media?.content?.album || media?.content;

  const isReview = act.action === "review_created";

  return {
    id: act.id, 
    type: isReview ? "review" : "like",
    
    user_name: act.user?.name || act.user?.username || review?.user?.name || "Utilisateur",
    user_image: act.user?.image || review?.user?.image, 

    album: 
      externalContent?.name || 
      media?.title || 
      review?.album_title || 
      review?.media?.title || 
      "Album inconnu",

    artist: 
      externalContent?.artist || 
      media?.artist || 
      review?.artist_name || 
      review?.media?.artist || 
      "Artiste inconnu",

    cover: 
      (externalContent?.image ? getImageUrl(externalContent.image) : null) || 
      media?.cover_url || 
      review?.media?.cover_url ||
      "https://via.placeholder.com/300",

    media_id: media?.id || act.media_id || review?.media_id,
    review_id: review?.id || act.review_id,

    rating: review?.rating || act.rating_from_user,
    content: review?.content,
    likes_count: review?._count?.likes || 0,
    comments_count: review?._count?.comments || 0,
    isLiked: !!(review?.likes && review.likes.length > 0),

    created_at: act.created_at,
  };
};
