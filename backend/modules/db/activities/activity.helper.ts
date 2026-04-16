import { PrismaDb } from "../../../config/database.js";
import {
  ActivityWithRelationsDto,
  FeedItem,
} from "../../../types/activities/activities.dto.js";

const placeholder_img = "";

export const getImageUrl = (images: any[]) => {
  if (!images || !images.length) return placeholder_img;

  // Sécurité pour Last.fm : on cherche l'image la plus grande
  const img =
    images.find((i) => i.size === "extralarge") || images[images.length - 1];

  const url = img["#text"];
  // Si Last.fm renvoie l'étoile grise par défaut, on considère que c'est vide
  if (url && url.includes("2a96cbd8b46e4423")) return placeholder_img;

  return url || placeholder_img;
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

  const url = image ? image["#text"] : null;

  if (url && url.includes("2a96cbd8b46e4423")) return null;

  return url;
};

export const mapToFeedItem = (act: any, feedType: string): FeedItem => {
  const review = act.review;
  const media = act.media || review?.media;
  const content = media?.content;

  let foundCover = null;

  if (content) {
    if (typeof content.cover === "string") {
      foundCover = content.cover;
    } else if (content.album?.image) {
      foundCover = extractLastFmImage(content.album.image);
    } else if (content.image) {
      foundCover = extractLastFmImage(content.image);
    }
  }

  // Si foundCover est une string vide ou contient l'image par défaut de Last.fm,
  // on s'assure de renvoyer "" pour que le mobile utilise son image locale.
  const albumCover =
    foundCover && foundCover.trim() !== ""
      ? foundCover
      : media?.cover_url || review?.media?.cover_url || "";

  const isReview = act.action === "review_created";

  return {
    id: act.id,
    type: isReview ? "review" : "like",

    user_id: act.user?.id || review?.user?.id,
    user_name:
      act.user?.name ||
      act.user?.username ||
      review?.user?.name ||
      "Utilisateur",
    user_image: act.user?.image || review?.user?.image,

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

    // On renvoie la string (URL ou vide)
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
