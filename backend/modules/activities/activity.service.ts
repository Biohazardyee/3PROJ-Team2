import { prisma } from '../../config/database.js';
import { BadRequest, NotFound } from '../../utils/errors.js';
import { isEmptyString } from '../../utils/helpers.js';
import { ActivityAction } from '../../generated/prisma/browser.js';

export class ActivityService {

    async create(data: {
        user_id: string;
        action: ActivityAction;
        target_user_id?: string;
        review_id?: string;
        media_id?: string;
        rating_from_user?: number;
    }) {

        const { user_id, action, target_user_id, review_id, media_id, rating_from_user } = data;

        if (isEmptyString(user_id)) {
            throw new BadRequest('user_id is required');
        }

        if (!action || !Object.values(ActivityAction).includes(action)) {
            throw new BadRequest('Invalid activity action');
        }

        // Validate user
        const user = await prisma.user.findUnique({ where: { id: user_id } });
        if (!user) throw new BadRequest('User not found');

        // Optional target user
        if (target_user_id) {
            const targetUser = await prisma.user.findUnique({ where: { id: target_user_id } });
            if (!targetUser) throw new BadRequest('Target user not found');
        }

        // Optional review
        if (review_id) {
            const review = await prisma.review.findUnique({ where: { id: review_id } });
            if (!review) throw new BadRequest('Review not found');
        }

        // Optional media
        if (media_id) {
            const media = await prisma.media.findUnique({ where: { id: media_id } });
            if (!media) throw new BadRequest('Media not found');
        }

        // Optional rating
        if (rating_from_user !== undefined) {
            if (rating_from_user < 0 || rating_from_user > 10) {
                throw new BadRequest('rating_from_user must be between 0 and 10');
            }
        }

        return prisma.activity.create({
            data,
            select: {
                id: true,
                user_id: true,
                action: true,
                created_at: true,
            },
        });
    }

    async getByUserFeed(user_id: string) {

        if (isEmptyString(user_id)) {
            throw new BadRequest('user_id is required');
        }

        const user = await prisma.user.findUnique({ where: { id: user_id } });
        if (!user) throw new NotFound('User not found');

        // User feed: their activities + followed users
        const following = await prisma.follow.findMany({
            where: { follow_user_id: user_id },
            select: { follow_user_id: true },
        });

        const userIds = [
            user_id,
            ...following.map(f => f.follow_user_id),
        ];

        return prisma.activity.findMany({
            where: { user_id: { in: userIds } },
            orderBy: { created_at: 'desc' },
            select: {
                id: true,
                action: true,
                created_at: true,
                rating_from_user: true,
                user: {
                    select: { id: true, username: true },
                },
                target_user: {
                    select: { id: true, username: true },
                },
                review: {
                    select: { id: true, rating: true },
                },
                media: {
                    select: { id: true, api_id: true },
                },
            },
        });
    }

    async delete(id: string) {

        if (isEmptyString(id)) {
            throw new BadRequest('Activity id is required');
        }

        try {
            return await prisma.activity.delete({
                where: { id },
                select: { id: true },
            });
        } catch {
            throw new NotFound('Activity not found');
        }
    }

    async getAll() {
        return prisma.activity.findMany({
            orderBy: { created_at: 'desc' },
            select: {
                id: true,
                user_id: true,
                action: true,
                created_at: true,
            },
        });
    }

    async getById(id: string) {

        if (isEmptyString(id)) {
            throw new BadRequest('Activity id is required');
        }
        const activity = await prisma.activity.findUnique({
            where: { id },
            select: {
                id: true,
                user_id: true,
                action: true,
                created_at: true,
            },
        });
        if (!activity) {
            throw new NotFound('Activity not found');
        }
        return activity;
    }
}

export const activityService = new ActivityService();
