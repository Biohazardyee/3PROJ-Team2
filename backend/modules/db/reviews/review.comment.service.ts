import {PrismaDb} from '../../../config/database.js';
import {NotFound, BadRequest} from '../../../utils/errors.js';
import {isValidStringLength, isEmptyString} from "../../../utils/helpers.js";

export class ReviewCommentService {

    async create(data: {
        user_id: string,
        review_id: string,
        content: string,
        created_at: Date,
    }) {

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

        const user = await PrismaDb.user.findUnique({
            where: {
                id: data.user_id,
            }
        })

        if (!user) {
            throw new BadRequest("The user doesn't exist");
        }

        const review = await PrismaDb.review.findUnique({
            where: {
                id: data.review_id,
            }
        })

        if (!review) {
            throw new BadRequest('The review doesn\'t exist');
        }

        return PrismaDb.reviewComment.create({
            data,
            select: {
                user_id: true,
                review_id: true,
                content: true,
                created_at: true,
            },
        });
    }

    async getAll() {
        return PrismaDb.reviewComment.findMany({
            select: {
                user_id: true,
                review_id: true,
                content: true,
                created_at: true,
            }
        });
    }

    async getById(id: string) {

        if (isEmptyString(id)) {
            throw new BadRequest("ID cannot be empty");
        }

        const reviewComment = await PrismaDb.reviewComment.findUnique({
            where: {
                id: id,
            },
            select: {
                user_id: true,
                review_id: true,
                content: true,
                created_at: true
            }
        });

        if (!reviewComment) {
            throw new NotFound('Comment not found');
        }

        return reviewComment;
    }

    async update(id: string, data: {
        content?: string
    }) {

        if (isEmptyString(id)) {
            throw new BadRequest("ID cannot be empty");
        }

        const reviewComment = await PrismaDb.reviewComment.findUnique({
            where: {
                id: id,
            }
        })

        if (!reviewComment) {
            throw new NotFound('Comment does not exist');
        }

        const allowedFields = [
            'content'
        ];

        for (const key of Object.keys(data)) {
            if (!allowedFields.includes(key)) {
                throw new BadRequest(`Field "${key}" cannot be updated`);
            }
        }

        if (data.content) {
            if (isEmptyString(data.content)) {
                throw new BadRequest('Content cannot be empty');
            }
            if (!isValidStringLength(data.content, 1000)) {
                throw new BadRequest('Content cannot be much than 1000 characters');
            }
        }

        return PrismaDb.reviewComment.update({
            where: {
                id
            },
            data,
            select: {
                user_id: true,
                review_id: true,
                content: true,
                created_at: true,
            }
        });
    }

    async delete(id: string) {

        if (isEmptyString(id)) {
            throw new BadRequest("ID cannot be empty");
        }

        return PrismaDb.reviewComment.delete({
            where: {
                id: id,
            },
            select: {
                user_id: true,
                review_id: true,
                content: true,
                created_at: true
            },
        });
    }
}

export const reviewCommentService = new ReviewCommentService();