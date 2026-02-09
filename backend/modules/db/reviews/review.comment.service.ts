import {PrismaDb} from '../../../config/database.js';
import {NotFound, BadRequest} from '../../../utils/errors.js';
import {isValidStringLength, isEmptyString} from "../../../utils/helpers.js";
import {
    ReviewCommentAddDto,
    ReviewCommentResponseDto,
    ReviewCommentUpdateDto
} from "../../../types/reviews/review.comment.dto.js";
import {User, Reviews, ReviewComments} from "../../../generated/prisma/browser.js";
import {reviewCommentMapper} from "../../../mappers/reviews/review.comment.mapper.js";
import {Prisma} from '../../../generated/prisma/client.js';

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

        const user: User | null = await PrismaDb.user.findUnique({
            where: {
                id: data.user_id,
            }
        })

        if (!user) {
            throw new BadRequest("The user doesn't exist");
        }

        const review: Reviews | null = await PrismaDb.reviews.findUnique({
            where: {
                id: data.review_id,
            }
        })

        if (!review) {
            throw new BadRequest('The review doesn\'t exist');
        }

        const reviewComment: ReviewComments = await PrismaDb.reviewComments.create({
            data,
        });

        return reviewCommentMapper.toDto(reviewComment);
    }

    async getAll(): Promise<ReviewCommentResponseDto[]> {
        const ReviewComments: ReviewComments[] = await PrismaDb.reviewComments.findMany({
            orderBy: {
                created_at: 'desc'
            }
        });

        return reviewCommentMapper.toDtoList(ReviewComments);
    }

    async getById(id: string): Promise<ReviewCommentResponseDto> {

        if (isEmptyString(id)) {
            throw new BadRequest("ID cannot be empty");
        }

        const reviewComment: ReviewComments | null = await PrismaDb.reviewComments.findUnique({
            where: {
                id,
            },
        });

        if (!reviewComment) {
            throw new NotFound('Comment not found');
        }

        return reviewCommentMapper.toDto(reviewComment);
    }

    async update(id: string, data: ReviewCommentUpdateDto): Promise<ReviewCommentResponseDto> {

        if (isEmptyString(id)) {
            throw new BadRequest("ID cannot be empty");
        }

        const reviewComment: ReviewComments | null = await PrismaDb.reviewComments.findUnique({
            where: {
                id: id,
            }
        })

        if (!reviewComment) {
            throw new NotFound('Comment does not exist');
        }

        const updateData: Prisma.ReviewCommentsUpdateInput = {};

        if (data.content !== undefined) {
            if (isEmptyString(data.content)) {
                throw new BadRequest('Content cannot be empty');
            }
            if (!isValidStringLength(data.content, 1000)) {
                throw new BadRequest('Content cannot be much than 1000 characters');
            }
            updateData.content = data.content.trim();
        }

        const updatedReviewComment: ReviewComments = await PrismaDb.reviewComments.update({
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

        const reviewComment: ReviewComments | null = await PrismaDb.reviewComments.findUnique({
            where: {
                id: id,
            }
        })

        if (!reviewComment) {
            throw new NotFound('Comment does not exist');
        }

        const reviewCommentToDelete: ReviewCommentResponseDto = await PrismaDb.reviewComments.delete({
            where: {
                id: id,
            }
        })

        return reviewCommentMapper.toDto(reviewCommentToDelete);

    }
}

export const reviewCommentService = new ReviewCommentService();