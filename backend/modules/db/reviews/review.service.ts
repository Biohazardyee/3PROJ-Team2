import {PrismaDb} from '../../../config/database.js';
import {NotFound, BadRequest} from '../../../utils/errors.js';
import {isEmptyString, isValidStringLength} from "../../../utils/helpers.js";
import {
    ReviewAddDto,
    ReviewResponseAddDto, ReviewResponseDeleteDto,
    ReviewResponseDto,
    ReviewUpdateDto
} from "../../../types/reviews/review.dto";
import {Prisma} from '../../../generated/prisma/client.js';
import {Medias, User, Reviews} from "../../../generated/prisma/browser.js";
import {reviewMapper} from "../../../mappers/reviews/review.mapper";

export class ReviewService {

    async create(data: ReviewAddDto): Promise<ReviewResponseAddDto> {

        if (isEmptyString(data.user_id)) {
            throw new BadRequest('user_id cannot be empty');
        }

        if (isEmptyString(data.media_id)) {
            throw new BadRequest('media_id cannot be empty');
        }

        if (!isValidFloatRating(data.rating)) {
            throw new BadRequest('Rating must be a float between 0 and 5');
        }

        if (isEmptyString(data.content)) {
            throw new BadRequest('Content cannot be empty');
        }

        if (!isValidStringLength(data.content, 1000)) {
            throw new BadRequest('Content is too long (max 1000 characters)');
        }

        const user: User | null = await PrismaDb.user.findUnique({
            where: {
                id: data.user_id
            },
        });

        if (!user) {
            throw new BadRequest('User with this id does not exist');
        }

        const media: Medias | null = await PrismaDb.medias.findUnique({
            where: {
                id: data.media_id
            },
        });

        if (!media) {
            throw new BadRequest('Media with this id does not exist');
        }

        const alreadyReviewed: Reviews | null = await PrismaDb.reviews.findFirst({
            where: {
                user_id: data.user_id,
                media_id: data.media_id,
            },
        });

        if (alreadyReviewed) {
            throw new BadRequest('User has already reviewed this media');
        }

        const review: Reviews = await PrismaDb.reviews.create({
            data
        })

        return reviewMapper.toAddDto(review);
    }

    async getAll(): Promise<ReviewResponseDto[]> {
        const reviews: Reviews[] = await PrismaDb.reviews.findMany({
            orderBy: {
                created_at: 'desc'
            }
        });

        return reviewMapper.toDtoList(reviews);
    }

    async getById(id: string):Promise<ReviewResponseDto> {

        if (isEmptyString(id)) {
            throw new BadRequest('Review id cannot be empty');
        }

        const review: Reviews | null = await PrismaDb.reviews.findUnique({
            where: {
                id
            },
        });

        if (!review) {
            throw new NotFound('Review not found');
        }

        return reviewMapper.toDto(review);
    }

    async update(id: string, data: ReviewUpdateDto): Promise<ReviewResponseDto> {

        if (isEmptyString(id)) {
            throw new BadRequest('Review id cannot be empty');
        }

        const review: Reviews | null = await PrismaDb.reviews.findUnique({
            where: {
                id
            }
        });

        if (!review) {
            throw new NotFound('Review not found');
        }

        const updateData: Prisma.ReviewsUpdateInput = {};

        if (data.rating !== undefined) {
            if (!isValidFloatRating(data.rating)) {
                throw new BadRequest('Rating must be a float between 0 and 5');
            }
        }

        if (data.content !== undefined) {
            if (isEmptyString(data.content)) {
                throw new BadRequest('Content is required');
            }
            if (!isValidStringLength(data.content, 1000)) {
                throw new BadRequest('Content is too long (max 1000 characters)');
            }

            updateData.content = data.content.trim();
        }

        const reviewUpdate: Reviews = await PrismaDb.reviews.update({
            where: {
                id
            },
            data: updateData,
        });

        return reviewMapper.toDto(reviewUpdate);
    }

    async delete(id: string): Promise<ReviewResponseDeleteDto> {

        if (isEmptyString(id)) {
            throw new BadRequest('Review id cannot be empty');
        }

        try {
            const review: Reviews | null = await PrismaDb.reviews.findUnique({
                where: {
                    id
                },
            });

            if (!review) {
                throw new NotFound('Review not found');
            }

            const reviewToDelete: Reviews = await PrismaDb.reviews.delete({
                where: {
                    id
                },
            })

            return reviewMapper.toDeleteDto(reviewToDelete);

        } catch (error) {
            throw error;
        }
    }
}
