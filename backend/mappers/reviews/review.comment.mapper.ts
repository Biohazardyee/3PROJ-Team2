import { BaseMapper } from '../base.mapper.js';
import { ReviewCommentResponseDto } from "../../types/reviews/review.comment.dto.js";

class ReviewCommentMapper extends BaseMapper<any, ReviewCommentResponseDto> {

    protected mapOne(comment: any): ReviewCommentResponseDto {
        return {
            id: comment.id,
            user_id: comment.user_id,
            review_id: comment.review_id,
            content: comment.content,
            created_at: comment.created_at,
            parent_id: comment.parent_id ?? null,

            likes_count: comment.likes_count ?? comment._count?.commentLikes ?? 0,


            isLiked: comment.isLiked ?? false,

            user: comment.user ? {
                id: comment.user.id,
                username: comment.user.username,
                pseudo: comment.user.pseudo ?? null
            } : undefined
        };
    }
}

export const reviewCommentMapper = new ReviewCommentMapper();