import { BaseMapper } from "../base.mapper.js";
import { Reviews } from "../../generated/prisma/browser.js";
import {
  ReviewResponseAddDto,
  ReviewResponseDeleteDto,
  ReviewResponseDto,
  ReviewWithMediaDto,
} from "../../types/reviews/review.dto.js";
import { Prisma } from "../../generated/prisma/client.js";

type ReviewWithMedia = Prisma.ReviewsGetPayload<{
  include: { media: true };
}>;

type ReviewFull = Prisma.ReviewsGetPayload<{
  include: {
    user: true;
    media: true;
    _count: {
      select: {
        likes: true; // Assure-toi que le nom de la relation est 'likes' dans ton schema.prisma
        comments: true;
      };
    };
  };
}>;
class ReviewMapper extends BaseMapper<Reviews, ReviewResponseDto> {
  private parseMediaContent(media: any) {
    if (!media) return null;

    let raw = media.content;

   
    if (typeof raw === "string") {
      try {
        raw = JSON.parse(raw);
      } catch (e) {
        return { id: media.id, content: {} };
      }
    }

    let normalizedContent = {
      name: "",
      artist: "",
      cover: "",
    };

    if (raw.album) {
      
      normalizedContent.name = raw.album.name;
      normalizedContent.artist = raw.album.artist;

      if (Array.isArray(raw.album.image)) {
        const imageObj =
          raw.album.image.find((i: any) => i.size === "extralarge") ||
          raw.album.image[raw.album.image.length - 1];
        normalizedContent.cover = imageObj?.["#text"] || "";
      }
    } else {
    
      normalizedContent.name = raw.name || "";
      normalizedContent.artist = raw.artist || "";
      normalizedContent.cover = raw.cover || "";
    }

    return {
      id: media.id,
      content: normalizedContent, 
    };
  }

  protected mapOne(review: Reviews): ReviewResponseDto {
    const r = review as ReviewFull;
    return {
      id: r.id,
      user_id: r.user_id,
      media_id: r.media_id,
      rating: r.rating,
      title: r.title,
      content: r.content,
      created_at: r.created_at,
      updated_at: r.updated_at,
      likes_count: r._count?.likes ?? 0,
      comments_count: r._count?.comments ?? 0,
      isLiked: false,
      user: r.user ? { username: r.user.username } : undefined,
      media: this.parseMediaContent(r.media) as any,
    };
  }

  toAddDto(review: Reviews): ReviewResponseAddDto {
    return {
      id: review.id,
      user_id: review.user_id,
      media_id: review.media_id,
      rating: review.rating,
      title: review.title,
      content: review.content,
      created_at: review.created_at,
    };
  }

  toDeleteDto(review: Reviews): ReviewResponseDeleteDto {
    return {
      id: review.id,
      user_id: review.user_id,
      media_id: review.media_id,
    };
  }

  toReviewWithMediaDto(review: any): ReviewWithMediaDto {
 
    return {
      id: review.id,
      rating: review.rating,
      user_id: review.user_id,
      media_id: review.media_id,
      title: review.title,
      content: review.content,
      created_at: review.created_at,
      likes: review.likes || [],
      likes_count: review._count?.likes ?? 0, // On l'ajoute ici aussi
      _count: review._count || { comments: 0, likes: 0 },
      user: review.user
        ? {
            username: review.user.username,
            id: review.user.id,
          }
        : null,
      media: this.parseMediaContent(review.media),
    };
  }

  toReviewWithMediaDtoList(reviews: any[]): ReviewWithMediaDto[] {
    return reviews.map((r) => this.toReviewWithMediaDto(r));
  }
}

export const reviewMapper = new ReviewMapper();
