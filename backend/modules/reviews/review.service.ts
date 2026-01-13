import {prisma} from '../../config/database.js';
import {NotFound, BadRequest} from '../../utils/errors.js';
import {isNonEmptyString, isValidStringLength} from "../../utils/helpers.js";

export class ReviewService {

    async create(data: any) {

        if (!isNonEmptyString(data.user_id)) {
            throw new BadRequest('user_id is required');
        }

        if (!isNonEmptyString(data.media_id)) {
            throw new BadRequest('media_id is required');
        }

        if (!isValidFloatRating(data.rating)) {
            throw new BadRequest('Rating must be a float between 0 and 5');
        }

        if (!isNonEmptyString(data.content)) {
            throw new BadRequest('Content is required');
        }

        if (!isValidStringLength(data.content.length, 1000)) {
            throw new BadRequest('Content is too long (max 1000 characters)');
        }

        const user = await prisma.user.findUnique({
            where: {
                id: data.user_id
            },
        });

        if (!user) {
            throw new BadRequest('User with this id does not exist');
        }

        const media = await prisma.media.findUnique({
            where: {id: data.media_id},
        });

        if (!media) {
            throw new BadRequest('Media with this id does not exist');
        }

        const alreadyReviewed = await prisma.review.findFirst({
            where: {
                user_id: data.user_id,
                media_id: data.media_id,
            },
        });

        if (alreadyReviewed) {
            throw new BadRequest('User has already reviewed this media');
        }

        return prisma.review.create({
            data: {
                user_id: data.user_id,
                media_id: data.media_id,
                rating: normalizeRating(data.rating),
                content: data.content.trim(),
            },
        });
    }

    async getById(id: string) {
        if (!isNonEmptyString(id)) {
            throw new BadRequest('Review id is required');
        }

        const review = await prisma.review.findUnique({
            where: {id},
        });

        if (!review) {
            throw new NotFound('Review not found');
        }

        return review;
    }

    async getAll() {
        return prisma.review.findMany();
    }

    async update(id: string, data: any) {
        if (!id) {
            throw new BadRequest('Review id is required');
        }

        const review = await prisma.review.findUnique({
            where: {id},
        });

        if (!review) {
            throw new NotFound('Review not found');
        }

        const allowedFields = [
            'rating',
            'content'
        ];

        for (const key of Object.keys(data)) {
            if (!allowedFields.includes(key)) {
                throw new BadRequest(`Field "${key}" cannot be updated`);
            }
        }

        if (data.rating && !isValidFloatRating(data.rating)) {
            throw new BadRequest('Rating must be a float between 0 and 5');
        }

        if (data.content) {
            if (!isNonEmptyString(data.content)) {
                throw new BadRequest('Content is required');
            }
            if (!isValidStringLength(data.content, 1000)) {
                throw new BadRequest('Content is too long (max 1000 characters)');
            }
        }

        return prisma.review.update({
            where: {id},
            data,
        });
    }

    async delete(id: string) {
        if (!isNonEmptyString(id)) {
            throw new BadRequest('Review id is required');
        }

        const review = await prisma.review.findUnique({
            where: {id},
        });

        if (!review) {
            throw new NotFound('Review not found');
        }

        return prisma.review.delete({
            where: {id},
        });
    }
}
