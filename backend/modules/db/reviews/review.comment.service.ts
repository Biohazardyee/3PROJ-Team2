import { PrismaDb } from "../../../config/database.js";
import { NotFound, BadRequest } from "../../../utils/errors.js";
import { isValidStringLength, isEmptyString } from "../../../utils/helpers.js";
import {
  ReviewCommentAddDto,
  ReviewCommentResponseDto,
  ReviewCommentUpdateDto,
} from "../../../types/reviews/review.comment.dto.js";
import {
  Users,
  Reviews,
  ReviewComments,
} from "../../../generated/prisma/browser.js";
import { reviewCommentMapper } from "../../../mappers/reviews/review.comment.mapper.js";
import { Prisma } from "../../../generated/prisma/client.js";
import { notificationService } from "../notifications/notification.service.js";
import { NotificationActions } from "../../../generated/prisma/enums.js";
import { canSendNotification } from "../notifications/notification.helper.js";

export class ReviewCommentService {
  async create(data: ReviewCommentAddDto): Promise<ReviewCommentResponseDto> {
    if (isEmptyString(data.user_id)) {
      throw new BadRequest("User_id cannot be empty");
    }

    if (isEmptyString(data.review_id)) {
      throw new BadRequest("Review_id cannot be empty");
    }

    if (isEmptyString(data.content)) {
      throw new BadRequest("Content cannot be empty");
    }

    if (!isValidStringLength(data.content, 1000)) {
      throw new BadRequest("Content length cannot exceed 1000 characters");
    }

    if (data.parent_id) {
      const parent = await PrismaDb.reviewComments.findUnique({
        where: { id: data.parent_id },
      });
      if (!parent) throw new BadRequest("Parent comment does not exist");
    }

    const user: Users | null = await PrismaDb.users.findUnique({
      where: {
        id: data.user_id,
      },
    });

    if (!user) {
      throw new BadRequest("The user doesn't exist");
    }

    const review: Reviews | null = await PrismaDb.reviews.findUnique({
      where: {
        id: data.review_id,
      },
    });

    if (!review) {
      throw new BadRequest("The review doesn't exist");
    }

    const reviewComment = await PrismaDb.reviewComments.create({
      data: {
        user_id: data.user_id,
        review_id: data.review_id,
        content: data.content,
        parent_id: data.parent_id,
      },
      include: {
        user: true,
      },
    });

    if (review && data.user_id !== review.user_id) {
      const isAllowed = await canSendNotification(
        review.user_id,
        data.user_id,
        "comment_added",
        2,
      );

      if (isAllowed) {
        notificationService
          .create({
            user_id: review.user_id,
            action: NotificationActions.comment_added,
            related_user_id: data.user_id,
            review_id: data.review_id,
          })
          .catch((err) => console.error("Push failed:", err));
      }
    }
    
    return reviewCommentMapper.toDto(reviewComment);
  }

  async getAll(): Promise<ReviewCommentResponseDto[]> {
    const ReviewComments: ReviewComments[] =
      await PrismaDb.reviewComments.findMany({
        orderBy: {
          created_at: "desc",
        },
      });

    return reviewCommentMapper.toDtoList(ReviewComments);
  }

  async getById(id: string): Promise<ReviewCommentResponseDto> {
    if (isEmptyString(id)) {
      throw new BadRequest("ID cannot be empty");
    }

    const reviewComment: ReviewComments | null =
      await PrismaDb.reviewComments.findUnique({
        where: {
          id,
        },
      });

    if (!reviewComment) {
      throw new NotFound("Comment not found");
    }

    return reviewCommentMapper.toDto(reviewComment);
  }

  async update(
    id: string,
    data: ReviewCommentUpdateDto,
  ): Promise<ReviewCommentResponseDto> {
    if (isEmptyString(id)) {
      throw new BadRequest("ID cannot be empty");
    }

    const reviewComment: ReviewComments | null =
      await PrismaDb.reviewComments.findUnique({
        where: {
          id: id,
        },
      });

    if (!reviewComment) {
      throw new NotFound("Comment does not exist");
    }

    const updateData: Prisma.ReviewCommentsUpdateInput = {};

    if (data.content !== undefined) {
      if (isEmptyString(data.content)) {
        throw new BadRequest("Content cannot be empty");
      }
      if (!isValidStringLength(data.content, 1000)) {
        throw new BadRequest("Content cannot be much than 1000 characters");
      }
      updateData.content = data.content.trim();
    }

    const updatedReviewComment: ReviewComments =
      await PrismaDb.reviewComments.update({
        where: {
          id: id,
        },
        data: updateData,
      });

    return reviewCommentMapper.toDto(updatedReviewComment);
  }

  async delete(id: string): Promise<ReviewCommentResponseDto> {
    if (isEmptyString(id)) {
      throw new BadRequest("ID cannot be empty");
    }

    const reviewComment: ReviewComments | null =
      await PrismaDb.reviewComments.findUnique({
        where: {
          id: id,
        },
      });

    if (!reviewComment) {
      throw new NotFound("Comment does not exist");
    }

    const reviewCommentToDelete: ReviewCommentResponseDto =
      await PrismaDb.reviewComments.delete({
        where: {
          id: id,
        },
      });

    return reviewCommentMapper.toDto(reviewCommentToDelete);
  }
}

export const reviewCommentService = new ReviewCommentService();
