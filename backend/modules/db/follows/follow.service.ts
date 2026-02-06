import {PrismaDb} from '../../../config/database.js';
import {BadRequest, NotFound} from '../../../utils/errors.js';
import {isEmptyString} from '../../../utils/helpers.js';

export class FollowService {

    async create(data: { user_id: string; follow_user_id: string }) {

        const {user_id, follow_user_id} = data;


        if (isEmptyString(user_id) || isEmptyString(follow_user_id)) {
            throw new BadRequest('user_id and follow_user_id cannot be empty');
        }

        if (user_id === follow_user_id) {
            throw new BadRequest('You cannot follow yourself');
        }


        const [user, target] = await Promise.all([
            PrismaDb.user.findUnique({
                where: {
                    id: user_id
                }
            }),
            PrismaDb.user.findUnique({
                where: {
                    id: follow_user_id
                }
            }),
        ]);

        if (!user) {
            throw new BadRequest('User not found');
        }

        if (!target) {
            throw new BadRequest('Target user not found');
        }

        const exists = await PrismaDb.follow.findUnique({
            where: {
                user_id_follow_user_id: {
                    user_id,
                    follow_user_id
                }
            },
        });

        if (exists) {
            throw new BadRequest('Already following this user');
        }

        return PrismaDb.follow.create({
            data: {user_id, follow_user_id},
            select: {
                user_id: true,
                follow_user_id: true,
                created_at: true,
            },
        });
    }

    async delete(user_id: string, follow_user_id: string) {

        if (isEmptyString(user_id) || isEmptyString(follow_user_id)) {
            throw new BadRequest('user_id and follow_user_id cannot be empty');
        }

        try {
            return await PrismaDb.follow.delete({
                where: {
                    user_id_follow_user_id: {
                        user_id,
                        follow_user_id
                    }
                },
                select: {
                    user_id: true,
                    follow_user_id: true,
                },
            });
        } catch {
            throw new NotFound('Follow relation not found');
        }
    }

    async getFollowers(user_id: string) {

        if (isEmptyString(user_id)) {
            throw new BadRequest('user_id cannot be empty');
        }

        const user = await PrismaDb.user.findUnique({
            where:
                {id: user_id}
        });
        if (!user) {
            throw new NotFound('User not found');
        }

        return PrismaDb.follow.findMany({
            where: {
                follow_user_id: user_id
            },
            orderBy: {created_at: 'desc'},
            select: {
                user: {
                    select: {
                        id: true,
                        username: true
                    }
                },
                created_at: true,
            },
        });
    }

    async getFollowing(user_id: string) {

        if (isEmptyString(user_id)) {
            throw new BadRequest('user_id cannot be empty');
        }

        const user = await PrismaDb.user.findUnique({
            where: {
                id: user_id
            }
        });

        if (!user) {
            throw new NotFound('User not found')
        }

        return PrismaDb.follow.findMany({
            where: {user_id},
            orderBy: {created_at: 'desc'},
            select: {
                follow_user: {
                    select: {
                        id: true,
                        username: true
                    }
                },
                created_at: true,
            },
        });
    }
}

export const followService = new FollowService();
