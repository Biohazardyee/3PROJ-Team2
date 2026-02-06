import {PrismaDb} from '../../../config/database.js';
import {NotFound, BadRequest} from '../../../utils/errors.js';
import {isEmptyString, isValidStringLength} from "../../../utils/helpers.js";
import {Prisma} from '../../../generated/prisma/client.js';

export class BanUserService {

    async create(data: Prisma.BannedUsersCreateInput) {

        const userId = typeof data.user === 'object' && 'connect' in data.user
            ? data.user.connect?.id
            : undefined;

        if (userId && isEmptyString(userId)) {
            throw new BadRequest('User id cannot be empty');
        }

        if (isEmptyString(data.content)) {
            throw new BadRequest('Ban reason cannot be empty');
        }

        if (!isValidStringLength(data.content, 255)) {
            throw new BadRequest('Ban reason cannot be longer than 255 chars');
        }

        const user = await PrismaDb.user.findUnique({where: {id}});
        if (!user) {
            throw new NotFound('User not found');
        }

        const alreadyBanned = await PrismaDb.bannedUsers.findUnique({
            where: {
                user_id: id
            }
        });

        if (alreadyBanned) {
            throw new BadRequest('User already banned');
        }

        return PrismaDb.bannedUsers.create({
            data: {
                user_id: id,
                content
            }
        })
    }

    async getAll() {
        return PrismaDb.bannedUsers.findMany({
            orderBy: {
                id: 'asc'
            },
            include: {
                user: {
                    select: {
                        id: true,
                        username: true,
                        email: true
                    }
                }
            },
        });
    }

    async getById(user_id: string) {
        if (isEmptyString(user_id)) {
            throw new BadRequest('The value of User ID cannot be empty');
        }

        const bannedUser = await PrismaDb.bannedUsers.findUnique({
            where: {
                user_id
            },
            include: {
                user: {
                    select: {
                        id: true,
                        username: true,
                        email: true
                    }
                }
            },
        });

        if (!bannedUser) {
            throw new NotFound('Banned user not found');
        }

        return bannedUser;
    }

    async update(id: string, data: { content: string }) {

        const {
            content
        } = data;

        if (isEmptyString(id)) {
            throw new BadRequest('Banned user id cannot be empty');
        }

        const bannedUser = await PrismaDb.bannedUsers.findUnique({
            where: {
                id
            }
        });

        if (!bannedUser) {
            throw new NotFound('Banned user not found');
        }

        if (content && !isValidStringLength(content, 255)) {
            throw new BadRequest("Ban reason content cannot be more than 255 characters");
        }

        return PrismaDb.bannedUsers.update({
            where: {
                id
            },
            data
        });
    }

    async delete(id: string) {

        if (isEmptyString(id)) {
            throw new BadRequest('Banned user id is required');
        }

        const bannedUser = await PrismaDb.bannedUsers.findUnique({
            where: {
                id
            }
        });

        if (!bannedUser) {
            throw new NotFound('Banned user not found');
        }

        return PrismaDb.bannedUsers.delete({where: {id}});
    }
}

export const banUserService = new BanUserService();