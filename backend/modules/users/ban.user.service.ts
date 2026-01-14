
import { prisma } from '../../config/database.js';
import { NotFound, BadRequest } from '../../utils/errors.js';
import { isEmptyString } from "../../utils/helpers.js";

export class BanUserService {


    async create(data: { id: string; content: string }) {

        if (isEmptyString(data.id)) {
            throw new BadRequest("User id cannot be empty");
        }

        if (isEmptyString(data.content)) {
            throw new BadRequest("Ban reason cannot be empty");
        }

        const user = await prisma.user.findUnique({
            where: { id: data.id }
        });

        if (!user) {
            throw new NotFound("User not found");
        }

        const alreadyBanned = await prisma.bannedUsers.findFirst({
            where: { user_id: data.id }
        });

        if (alreadyBanned) {
            throw new BadRequest("User already banned");
        }

        return prisma.$transaction(async (tx) => {
            const banRecord = await tx.bannedUsers.create({
                data: {
                    user_id: data.id,
                    content: data.content
                }
            });

            await tx.user.delete({
                where: { id: data.id }
            });

            return banRecord;
        });
    }

    getAll() {
        return prisma.bannedUsers.findMany();
    }

    getById(user_id: string) {
        return prisma.bannedUsers.findUnique({
            where: { user_id },
        });
    }


    async update(id: string, data: any) {
        if (!id) {
            throw new BadRequest('Banned user id is required');
        }

        const bannedUser = await prisma.bannedUsers.findUnique({
            where: { id },
        });

        if (!bannedUser) {
            throw new NotFound('Banned user not found')
        }

        const allowedFields = ['content'];

        const updateData: any = {};

        for (const key of Object.keys(data)) {
            if (allowedFields.includes(key)) {
                updateData[key] = data[key];
            }
            else {
                throw new BadRequest(`Field ${key} cannot be updated`);
            }
        }

        if (data.content && isEmptyString(data.content)) {
            throw new BadRequest('Ban content cannot be empty');
        }

        try {
            return await prisma.bannedUsers.update({
                where: { id },
                data: updateData,
            });
        }
        catch (error) {
            throw new BadRequest('Failed to update banned user');
        }
    }

    async delete(id: string) {
        if (!id) {
            throw new BadRequest('Banned user id is required');
        }

        const bannedUser = await prisma.bannedUsers.findUnique({
            where: { id },
        });

        if (!bannedUser) {
            throw new NotFound('Banned user not found')
        }

        try {
            return prisma.bannedUsers.delete({
                where: { id },
            });
        }
        catch (error) {
            throw new BadRequest('Failed to delete banned user');
        }
    }

}

export const banUserService = new BanUserService();