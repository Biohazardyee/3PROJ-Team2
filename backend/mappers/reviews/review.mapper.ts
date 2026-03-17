import {BaseMapper} from '../base.mapper.js';
import {Reviews} from "../../generated/prisma/browser.js";
import {
    ReviewResponseAddDto,
    ReviewResponseDeleteDto,
    ReviewResponseDto,
    ReviewWithMediaDto
} from "../../types/reviews/review.dto.js";
import {Prisma} from '../../generated/prisma/client.js';

type ReviewWithMedia = Prisma.ReviewsGetPayload<{
    include: { media: true }
}>;

class ReviewMapper extends BaseMapper<Reviews, ReviewResponseDto> {

    protected mapOne(review: Reviews): ReviewResponseDto {
        return {
            id: review.id,
            user_id: review.user_id,
            media_id: review.media_id,
            rating: review.rating,
            content: review.content,
            created_at: review.created_at,
            updated_at: review.updated_at
        };
    }

    toAddDto(review: Reviews): ReviewResponseAddDto {
        return {
            id: review.id,
            user_id: review.user_id,
            media_id: review.media_id,
            rating: review.rating,
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

    toReviewWithMediaDto(review: ReviewWithMedia): ReviewWithMediaDto {
        return {
            id: review.id,
            user_id: review.user_id,
            media_id: review.media_id,
            rating: review.rating,
            content: review.content,
            created_at: review.created_at,
            media: review.media ? { content: review.media.content } : null,
        };
    }

    toReviewWithMediaDtoList(reviews: ReviewWithMedia[]): ReviewWithMediaDto[] {
        return reviews.map(r => this.toReviewWithMediaDto(r));
    }
}

export const reviewMapper = new ReviewMapper();