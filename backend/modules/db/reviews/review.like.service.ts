import {prisma} from '../../../config/database.js';
import {NotFound, BadRequest} from '../../../utils/errors.js';
import {isValidStringLength, isEmptyString} from "../../../utils/helpers.js";

export class ReviewLikeService {

    async create(data: {
        user_id: string,
        review_id: string,
        created_at: Date,
    }) {

        if (isEmptyString(data.user_id)) {
            throw new BadRequest("User_id cannot be empty");
        }

        if (isEmptyString(data.review_id)) {
            throw new BadRequest("Review_id cannot be empty");
        }

        const user = await prisma.user.findUnique({
            where: {
                id: data.user_id,
            }
        })

        if (!user) {
            throw new BadRequest("The user doesn't exist");
        }

        const review = await prisma.review.findUnique({
            where: {
                id: data.review_id,
            }
        })

        if (!review) {
            throw new BadRequest('The review doesn\'t exist');
        }

        const alreadyLiked = await prisma.reviewLike.findUnique({
            where: {
                user_id_review_id: {
                    user_id: data.user_id,
                    review_id: data.review_id
                },
            },
        });

        if (alreadyLiked) {
            throw new BadRequest('Already Liked');
        }

        return prisma.reviewLike.create({
            data,
            select: {
                user_id: true,
                review_id: true,
                created_at: true,
            },
        });
    }


    async getAll() {
        return prisma.reviewLike.findMany({
            select: {
                user_id: true,
                review_id: true,
                created_at: true,
            }
        });
    }

    async getById(user_id: string, review_id: string) {

        if (isEmptyString(user_id)) {
            throw new BadRequest('User_id cannot be empty');
        }

        if (isEmptyString(review_id)) {
            throw new BadRequest('Review_id cannot be empty');
        }

        const reviewLike = await prisma.reviewLike.findUnique({
            where: {
                user_id_review_id: {
                    user_id: user_id,
                    review_id: review_id
                },
            },
            select: {
                user_id: true,
                review_id: true,
                created_at: true
            }
        });

        if (!reviewLike) {
            throw new NotFound('ReviewLike not found');
        }

        return reviewLike;
    }

    async update() {
        // This function don't have to be used for this table
        return null
    }

    async delete(review_id: string, user_id: string) {

        if (isEmptyString(user_id)) {
            throw new BadRequest('User_id cannot be empty');
        }

        if (isEmptyString(review_id)) {
            throw new BadRequest('Review_id cannot be empty');
        }

        try {
            return await prisma.reviewLike.delete({
                where: {
                    user_id_review_id: {
                        user_id: user_id,
                        review_id: review_id
                    },
                },
                select: {
                    user_id: true,
                    review_id: true,
                    created_at: true
                },
            });
        } catch {
            throw new NotFound('User not found');
        }
    }
}

export const reviewLikeService = new ReviewLikeService();