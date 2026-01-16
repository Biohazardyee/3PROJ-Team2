
import { prisma } from '../../config/database.js';
import { NotFound, BadRequest } from '../../utils/errors.js';
import { isEmptyString } from "../../utils/helpers.js";

export class BanUserService {

    async create(data: { id: string; content: string }) {
        const { id, content } = data;

        if (isEmptyString(id)) throw new BadRequest('User id cannot be empty');
        if (isEmptyString(content)) throw new BadRequest('Ban reason cannot be empty');

        // Check if user exists
        const user = await prisma.user.findUnique({ where: { id } });
        if (!user) throw new NotFound('User not found');

        // Check if already banned
        const alreadyBanned = await prisma.bannedUsers.findUnique({ where: { user_id: id } });
        if (alreadyBanned) throw new BadRequest('User already banned');

        // Ban user in a transaction: create ban + delete user
        return prisma.$transaction(async (tx) => {
            const banRecord = await tx.bannedUsers.create({
                data: { user_id: id, content },
            });

            await tx.user.delete({ where: { id } });

            return banRecord;
        });
    }

    async getAll() {
        return prisma.bannedUsers.findMany({
            orderBy: { id: 'asc' },
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
        if (isEmptyString(user_id)) throw new BadRequest('User id is required');

        const bannedUser = await prisma.bannedUsers.findUnique({
            where: { user_id },
            include: {
                user:
                {
                    select:
                    {
                        id: true,
                        username: true,
                        email: true
                    }
                }
            },
        });

        if (!bannedUser) throw new NotFound('Banned user not found');
        return bannedUser;
    }

    async update(id: string, data: { content?: string }) {
        if (isEmptyString(id)) throw new BadRequest('Banned user id is required');

        const bannedUser = await prisma.bannedUsers.findUnique({ where: { id } });
        if (!bannedUser) throw new NotFound('Banned user not found');

        const allowedFields = ['content'];

        const updateData: { content?: string } = {};

        for (const key of Object.keys(data)) {
            if (!allowedFields.includes(key)) {
                throw new BadRequest(`Field "${key}" cannot be updated`);
            }

            if (key === 'content') {
                const value = data[key];
                if (typeof value !== 'string' || isEmptyString(value)) {
                    throw new BadRequest('Ban content cannot be empty');
                }
                updateData.content = value; // safe assignment
            }
        }


        return prisma.bannedUsers.update({
            where: { id },
            data: updateData,
        });
    }

    async delete(id: string) {
        if (isEmptyString(id)) throw new BadRequest('Banned user id is required');

        const bannedUser = await prisma.bannedUsers.findUnique({ where: { id } });
        if (!bannedUser) throw new NotFound('Banned user not found');

        return prisma.bannedUsers.delete({ where: { id } });
    }
}

export const banUserService = new BanUserService();