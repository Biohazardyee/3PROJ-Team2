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

const extractLastFmImage = (imageArray: any) => {
  if (!Array.isArray(imageArray)) return null;

  const image =
    imageArray.find((i: any) => i.size === "extralarge") ||
    imageArray[imageArray.length - 1];
  return image ? image["#text"] : null;
};

export const mapToFeedItem = (act: any, feedType: string): FeedItem => {
  const review = act.review;
  const media = act.media || review?.media;
  const content = media?.content;

  // 1. On cherche l'image dans les différents formats de 'content'
  let foundCover = null;

  if (content) {
    // Cas A: Structure issue de syncSearchResults ({ cover: "http..." })
    if (typeof content.cover === "string") {
      foundCover = content.cover;
    }
    // Cas B: Structure Last.fm complète ({ album: { image: [] } })
    else if (content.album?.image) {
      foundCover = extractLastFmImage(content.album.image);
    }
    // Cas C: Structure Last.fm directe ({ image: [] })
    else if (content.image) {
      foundCover = extractLastFmImage(content.image);
    }
  }

  // 2. Fallbacks successifs
  const albumCover =
    foundCover ||
    media?.cover_url ||
    review?.media?.cover_url ||
    "https://via.placeholder.com/300";

  const isReview = act.action === "review_created";

  return {
    id: act.id,
    type: isReview ? "review" : "like",
    user_name:
      act.user?.name ||
      act.user?.username ||
      review?.user?.name ||
      "Utilisateur",
    user_image: act.user?.image || review?.user?.image,

    // On applique la même logique de flexibilité pour le titre et l'artiste
    album:
      content?.name ||
      content?.album?.name ||
      media?.title ||
      review?.album_title ||
      "Album inconnu",

    artist:
      content?.artist ||
      content?.album?.artist ||
      media?.artist ||
      review?.artist_name ||
      "Artiste inconnu",

    cover: albumCover,

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
