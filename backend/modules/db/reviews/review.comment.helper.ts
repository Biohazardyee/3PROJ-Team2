import {PrismaDb} from '../../../config/database.js';

export const getThreadByReview = async (reviewId: string, userId: string) => {
    const comments = await PrismaDb.reviewComments.findMany({
        where: {review_id: reviewId},
        include: {
            user: {
                select: {
                    id: true,
                    username: true,
                    pseudo: true,
                    profile_picture: true,
                    equipped_avatar_border: true,
                    equipped_font: true,
                    equipped_text_effect: true,
                }
            },
            _count: {
                select: {
                    commentLikes: true
                }
            },
            commentLikes: {
                where: {
                    user_id: userId
                }
            }
        },
        orderBy: {
            created_at: 'asc'
        }
    });

    return comments.map((comment: any) => ({
        ...comment,
        likes_count: comment._count.commentLikes,
        isLiked: comment.commentLikes && comment.commentLikes.length > 0
    }));
};

export async function toggleLike(commentId: string, userId: string): Promise<{
    isLiked: boolean;
    likes_count: number
}> {
    const existingLike = await PrismaDb.commentLikes.findUnique({
        where: {
            user_id_comment_id: {
                user_id: userId,
                comment_id: commentId,
            },
        },
    });

    if (existingLike) {
        await PrismaDb.commentLikes.delete({
            where: {
                user_id_comment_id: {
                    user_id: userId,
                    comment_id: commentId,
                },
            },
        });
    } else {
        await PrismaDb.commentLikes.create({
            data: {
                user_id: userId,
                comment_id: commentId,
            },
        });
    }

    const likesCount: number = await PrismaDb.commentLikes.count({
        where: {comment_id: commentId},
    });

    return {
        isLiked: !existingLike,
        likes_count: likesCount,
    };
}