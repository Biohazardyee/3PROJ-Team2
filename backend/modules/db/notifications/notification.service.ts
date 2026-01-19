import {prisma} from '../../../config/database.js';
import {BadRequest, NotFound} from '../../../utils/errors.js';
import {isEmptyString} from '../../../utils/helpers.js';
import {NotificationAction} from '../../../generated/prisma/browser.js';

export class NotificationService {

    async create(data: {
        user_id: string;
        action: NotificationAction;
        related_user_id?: string;
        review_id?: string;
        media_id?: string;
    }) {
        const {
            user_id,
            action,
            related_user_id,
            review_id,
            media_id
        } = data;


        if (isEmptyString(user_id)) {
            throw new BadRequest('user_id cannot be empty');
        }

        if (!action || !Object.values(NotificationAction).includes(action)) {
            throw new BadRequest('Invalid notification action');
        }


        const user = await prisma.user.findUnique({
            where: {
                id: user_id
            }
        });

        if (!user) {
            throw new BadRequest('User not found');
        }


        if (related_user_id) {
            const relatedUser = await prisma.user.findUnique({
                where: {
                    id: related_user_id
                }
            });

            if (!relatedUser) {
                throw new BadRequest('Related user not found');
            }
        }

        if (review_id) {
            const review = await prisma.review.findUnique({
                where:
                    {
                        id: review_id
                    }
            });
            if (!review) {
                throw new BadRequest('Review not found');
            }
        }

        if (media_id) {
            const media = await prisma.media.findUnique({
                where: {
                    id: media_id
                }
            });
            if (!media) {
                throw new BadRequest('Media not found');
            }
        }

        return prisma.notification.create({
            data,
            select: {
                id: true,
                user_id: true,
                action: true,
                is_read: true,
                created_at: true,
                related_user_id: true,
                review_id: true,
                media_id: true,
            },
        });
    }

    async getByUserId(user_id: string) {

        if (isEmptyString(user_id)) {
            throw new BadRequest('user_id cannot be empty');
        }

        const user = await prisma.user.findUnique({
            where: {
                id: user_id
            }
        });
        if (!user) {
            throw new NotFound('User not found');
        }

        return prisma.notification.findMany({
            where: {user_id},
            orderBy: {created_at: 'desc'},
            select: {
                id: true,
                action: true,
                is_read: true,
                read_at: true,
                created_at: true,
                related_user: {select: {id: true, username: true}},
                review: {select: {id: true, rating: true}},
                media: {select: {id: true, api_id: true}},
            },
        });
    }

    async update(id: string) {
        if (isEmptyString(id)) {
            throw new BadRequest('Notification id cannot be empty');
        }

        try {
            return await prisma.notification.update({
                where: {id},
                data: {
                    is_read: true,
                    read_at: new Date()
                },
                select: {
                    id: true,
                    is_read: true,
                    read_at: true
                },
            });
        } catch {
            throw new NotFound('Notification not found');
        }
    }

    async delete(id: string) {

        if (isEmptyString(id)) {
            throw new BadRequest('Notification id cannot be empty');
        }

        try {
            return await prisma.notification.delete({
                where: {id},
                select: {id: true},
            });
        } catch {
            throw new NotFound('Notification not found');
        }
    }

    async getAll() {
        return prisma.notification.findMany({
            orderBy: {created_at: 'desc'},
            select: {
                id: true,
                user_id: true,
                action: true,
                is_read: true,
                created_at: true,
            },
        });
    }

    async getById(id: string) {

        if (isEmptyString(id)) {
            throw new BadRequest('Notification id cannot be empty');
        }

        const notification = await prisma.notification.findUnique({
            where: {id},
            select: {
                id: true,
                user_id: true,
                action: true,
                is_read: true,
                read_at: true,
                created_at: true,
                related_user_id: true,
                review_id: true,
                media_id: true,
            },
        });

        if (!notification) {
            throw new NotFound('Notification not found');
        }

        return notification;
    }
}

export const notificationService = new NotificationService();
