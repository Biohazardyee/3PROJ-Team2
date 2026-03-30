import {PrismaDb} from '../../../config/database.js';
import {NotFound, BadRequest} from '../../../utils/errors.js';
import {isEmptyString} from "../../../utils/helpers.js";
import {ReviewLikeAddDto, ReviewLikeResponseDto} from "../../../types/reviews/review.like.dto.js";
import {Users, Reviews} from "../../../generated/prisma/client.js";
import {ReviewLikes} from "../../../generated/prisma/browser.js";
import {reviewLikeMapper} from "../../../mappers/reviews/review.like.mapper.js";

export class ReviewLikeService {

    async create(data: ReviewLikeAddDto): Promise<ReviewLikeResponseDto> {

        if (isEmptyString(data.user_id)) {
            throw new BadRequest("User_id cannot be empty");
        }

        if (isEmptyString(data.review_id)) {
            throw new BadRequest("Review_id cannot be empty");
        }

        const user: Users | null = await PrismaDb.users.findUnique({
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

        const alreadyLiked: ReviewLikes | null = await PrismaDb.reviewLikes.findUnique({
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

        const reviewLike: ReviewLikes = await PrismaDb.reviewLikes.create({
            data,
        });

        return reviewLikeMapper.toDto(reviewLike);
    }

    async getAll(): Promise<ReviewLikeResponseDto[]> {
        const reviewLikes: ReviewLikes[] = await PrismaDb.reviewLikes.findMany({
            orderBy: {
                created_at: 'desc'
            }
        });

        return reviewLikeMapper.toDtoList(reviewLikes);
    }

    async getById(user_id: string, review_id: string): Promise<ReviewLikeResponseDto> {

        if (isEmptyString(user_id)) {
            throw new BadRequest('User_id cannot be empty');
        }

        if (isEmptyString(review_id)) {
            throw new BadRequest('Review_id cannot be empty');
        }

        const reviewLike: ReviewLikes | null = await PrismaDb.reviewLikes.findUnique({
            where: {
                user_id_review_id: {
                    user_id: user_id,
                    review_id: review_id
                },
            },
        });

        if (!reviewLike) {
            throw new NotFound('ReviewLike not found');
        }

        return reviewLikeMapper.toDto(reviewLike);
    }

    async update(): Promise<null> {
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

        const user: Users | null = await PrismaDb.users.findUnique({
            where: {
                id: user_id,
            }
        })

        if (!user) {
            throw new BadRequest("The user doesn't exist");
        }

        const review: Reviews | null = await PrismaDb.reviews.findUnique({
            where: {
                id: review_id,
            }
        })

        if (!review) {
            throw new BadRequest('The review doesn\'t exist');
        }

        const likeToDelete: ReviewLikes = await PrismaDb.reviewLikes.delete({
            where: {
                user_id_review_id: {
                    user_id: user_id,
                    review_id: review_id
                },
            },
        })

        return reviewLikeMapper.toDto(likeToDelete);
    }

    
}

export const reviewLikeService = new ReviewLikeService();