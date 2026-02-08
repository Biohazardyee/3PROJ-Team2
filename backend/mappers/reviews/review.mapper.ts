import {BaseMapper} from '../base.mapper';
import {Reviews} from "../../generated/prisma/browser";
import {ReviewResponseAddDto, ReviewResponseDeleteDto, ReviewResponseDto} from "../../types/reviews/review.dto";

class ReviewMapper extends BaseMapper<Reviews, ReviewResponseDto> {

    /**
     * Implémentation de la méthode abstraite
     */
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

    toDeleteDto(review: Reviews): ReviewResponseDeleteDto{
        return {
            id: review.id,
            user_id: review.user_id,
            media_id: review.media_id,
        }
    }
}

export const reviewMapper = new ReviewMapper();