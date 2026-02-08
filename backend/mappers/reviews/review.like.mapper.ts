import {BaseMapper} from '../base.mapper';
import {ReviewLikes,} from "../../generated/prisma/browser";
import {ReviewLikeResponseDto} from "../../types/reviews/review.like.dto";

class ReviewMapper extends BaseMapper<ReviewLikes, ReviewLikeResponseDto> {

    /**
     * Implémentation de la méthode abstraite
     */
    protected mapOne(reviewLike: ReviewLikes): ReviewLikeResponseDto {
        return {
            user_id: reviewLike.user_id,
            review_id: reviewLike.review_id,
            created_at: reviewLike.created_at
        };
    }


}

export const reviewLikeMapper = new ReviewMapper();