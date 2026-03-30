import { BaseMapper } from '../base.mapper.js';
import { Reviews } from "../../generated/prisma/browser.js";
import {
    ReviewResponseAddDto,
    ReviewResponseDeleteDto,
    ReviewResponseDto,
    ReviewWithMediaDto
} from "../../types/reviews/review.dto.js";
import { Prisma } from '../../generated/prisma/client.js';

type ReviewWithMedia = Prisma.ReviewsGetPayload<{
    include: { media: true }
}>;

type ReviewFull = Prisma.ReviewsGetPayload<{
    include: {
        user: true,
        media: true,
        _count: {
            select: {
                likes: true,    // Assure-toi que le nom de la relation est 'likes' dans ton schema.prisma
                comments: true
            }
        }
    }
}>;
class ReviewMapper extends BaseMapper<Reviews, ReviewResponseDto> {

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

            user: r.user ? {
                username: r.user.username
            } : undefined,

            media: r.media ? {
                id: r.media.id,

                content: typeof r.media.content === 'string'
                    ? JSON.parse(r.media.content)
                    : r.media.content
            } : undefined
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
            created_at: review.created_at
        }
    }

    toDeleteDto(review: Reviews): ReviewResponseDeleteDto {
        return {
            id: review.id,
            user_id: review.user_id,
            media_id: review.media_id,
        }
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
            _count: review._count || { comments: 0 },
            user: review.user ? {
                username: review.user.username
            } : null,
            media: review.media ? {
                content: typeof review.media.content === 'string'
                    ? JSON.parse(review.media.content)
                    : review.media.content
            } : null
        };
    }

    toReviewWithMediaDtoList(reviews: ReviewWithMedia[]): ReviewWithMediaDto[] {
        return reviews.map(r => this.toReviewWithMediaDto(r));
    }
}

export const reviewMapper = new ReviewMapper();