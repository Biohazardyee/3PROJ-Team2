import {BaseMapper} from '../base.mapper.js';
import {ReviewComments} from "../../generated/prisma/browser.js";
import {ReviewCommentResponseDto} from "../../types/reviews/review.comment.dto.js";

class ReviewCommentMapper extends BaseMapper<ReviewComments, ReviewCommentResponseDto> {

    /**
     * Implémentation de la méthode abstraite
     */
    protected mapOne(reviewComment: ReviewComments ): ReviewCommentResponseDto  {
        return {
            id: reviewComment.id,
            user_id: reviewComment.user_id,
            review_id: reviewComment.review_id,
            content: reviewComment.content,
            created_at: reviewComment.created_at
        };
    }
}

export const reviewCommentMapper = new ReviewCommentMapper();