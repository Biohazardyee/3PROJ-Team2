import { prisma } from '../../config/database.js';
import { NotFound, BadRequest } from '../../utils/errors.js';

export class ReviewService {

    async create(data: any) {
        const user = await prisma.user.findFirst({
            where: {
                id: data.user_id,
            },
        });

        if (!user) {
            throw new BadRequest('User with this id doesnt exist');
        }

        const media = await prisma.media.findFirst({
            where: {
                id: data.media_id,
            },
        });

        if (!media) {
            throw new BadRequest('Media with this id doesnt exist');
        }

        if (!Number.isFinite(data.rating)) {
            throw new BadRequest('Rating must be a valid number');
        }

        if (data.rating < 0 || data.rating > 5) {
            throw new BadRequest('Rating must be between 0 and 5');
        }

        return prisma.review.create({
            data,
            select: {
                id: true,
                user_id: true,
                media_id: true,
                rating: true,
                content: true,
                created_at: true,
            },
        });
    }

    async getById(id: string) {
        const review = await prisma.review.findUnique({
            where: { id },
            select: {
                id: true,
                user_id: true,
                media_id: true,
                rating: true,
                content: true,
                created_at: true,
            },
        });
        if (!review) {
            throw new NotFound('Review not found');
        }
        return review;
    }

    async getAll() {
        return prisma.review.findMany({
            select: {
                id: true,
                user_id: true,
                media_id: true,
                rating: true,
                content: true,
                created_at: true,
            },
        });
    }

    async update(id: string, data: any) {
        const review = await prisma.media.findUnique({
            where: { id },
        });

        if (!review) {
            throw new NotFound('Review not found');
        }

        return prisma.review.update({
            where: { id },
            data,
            select: {
                id: true,
                user_id: true,
                media_id: true,
                rating: true,
                content: true,
                created_at: true,
            },
        });
    }

    async delete(id: string) {
        const review = await prisma.review.findUnique({
            where: { id },
        });
        if (!review) {
            throw new NotFound('Review not found');
        }

        return prisma.review.delete({
            where: { id },
            select: {
                id: true,
                user_id: true,
                media_id: true,
                rating: true,
                content: true,
                created_at: true,
            },
        })
    }

}