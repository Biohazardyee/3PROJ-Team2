import {PrismaDb} from '../../../config/database.js';
import {BadRequest, NotFound} from '../../../utils/errors.js';
import {isEmptyString} from '../../../utils/helpers.js';
import {Prisma} from '../../../generated/prisma/client.js';

export class ActivityService {

    async create(data: Prisma.ActivityUncheckedCreateInput) {
        const {
            user_id,
            action,
            target_user_id,
            review_id,
            media_id,
            rating_from_user
        } = data;

        if (isEmptyString(user_id)) {
            throw new BadRequest('The value of user_id cannot be empty');
        }

        if (!action) {
            throw new BadRequest('Invalid activity action');
        }

        const user = await PrismaDb.user.findUnique({
            where: {id: user_id},
        });

        if (!user) {
            throw new BadRequest('User not found');
        }

        if (target_user_id) {
            if (target_user_id === user_id) {
                throw new BadRequest('target_user_id cannot be the same as user_id');
            }

            const targetUser = await PrismaDb.user.findUnique({
                where: {id: target_user_id},
            });

            if (!targetUser) {
                throw new BadRequest('Target user not found');
            }
        }

        if (review_id) {
            const review = await PrismaDb.review.findUnique({
                where: {id: review_id},
            });

            if (!review) {
                throw new BadRequest('Review not found');
            }
        }

        if (media_id) {
            const media = await PrismaDb.media.findUnique({
                where: {id: media_id},
            });

            if (!media) {
                throw new BadRequest('Media not found');
            }
        }

        if (rating_from_user !== undefined && rating_from_user !== null) {
            if (rating_from_user < 0 || rating_from_user > 5) {
                throw new BadRequest('rating_from_user must be between 0 and 5');
            }
        }

        return PrismaDb.activity.create({
            data,
            select: {
                id: true,
                user_id: true,
                action: true,
                target_user_id: true,
                review_id: true,
                media_id: true,
                rating_from_user: true,
                created_at: true,
            },
        });
    }

    async getByUserFeed(user_id: string) {

        if (isEmptyString(user_id)) {
            throw new BadRequest('The value of user_id cannot be empty');
        }


        const user = await PrismaDb.user.findUnique({
            where: {
                id: user_id
            }
        });

        if (!user) {
            throw new NotFound('User not found')
        }

        const following = await PrismaDb.follow.findMany({
            where: {user_id},
            select: {follow_user_id: true},
        });

        const userIds: string[] = [user_id, ...following.map(f => f.follow_user_id)];

        return PrismaDb.activity.findMany({
            where: {
                user_id: {
                    in: userIds
                }
            },
            orderBy: {created_at: 'desc'},
            select: {
                id: true,
                user_id: true,
                action: true,
                created_at: true,
                rating_from_user: true,
                target_user_id: true,
                review_id: true,
                media_id: true,
                user: {
                    select: {
                        id: true,
                        username: true
                    }
                },
                target_user: {
                    select: {
                        id: true,
                        username: true
                    }
                },
                review: {
                    select: {
                        id: true, rating: true
                    }
                },
                media: {
                    select: {
                        id: true,
                        api_id: true
                    }
                },
            },
        });
    }

    async delete(id: string) {

        if (isEmptyString(id)) {
            throw new BadRequest('Activity id cannot be empty');
        }

        try {
            return await PrismaDb.activity.delete({
                where: {id},
                select: {id: true},
            });
        } catch {
            throw new NotFound('Activity not found');
        }
    }

    async getAll() {
        return PrismaDb.activity.findMany({
            orderBy: {created_at: 'desc'},
            select: {
                id: true,
                user_id: true,
                action: true,
                created_at: true,
                target_user_id: true,
                review_id: true,
                media_id: true,
                rating_from_user: true,
            },
        });
    }

    async getById(id: string) {

        if (isEmptyString(id)) {
            throw new BadRequest('Activity id cannot be empty');
        }

        const activity = await PrismaDb.activity.findUnique({
            where: {id},
            select: {
                id: true,
                user_id: true,
                action: true,
                created_at: true,
                target_user_id: true,
                review_id: true,
                media_id: true,
                rating_from_user: true,
            },
        });

        if (!activity) {
            throw new NotFound('Activity not found');
        }

        return activity;
    }
}

export const activityService = new ActivityService();
