import { prisma } from '../../config/database.js';
import { NotFound, BadRequest } from '../../utils/errors.js';

export class UserService {
    
    async create(data: any) {
        const exists = await prisma.user.findFirst({
            where: {
                OR: [{ email: data.email }, { username: data.username }],
            },
        });

        if (exists) {
            throw new BadRequest('Email or username already in use');
        }

        return prisma.user.create({
            data,
            select: {
                id: true,
                email: true,
                username: true,
                role: true,
                created_at: true,
            },
        });
    }

    async getByEmail(email: string) {
        return prisma.user.findUnique({
            where: { email },
        });
    }

    async getAll() {
        return prisma.user.findMany({
            select: {
                id: true,
                email: true,
                username: true,
                role: true,
                biography: true,
                favorite_band: true,
                has_notifications: true,
                created_at: true,
            },
        });
    }

    async getById(id: string) {
        const user = await prisma.user.findUnique({
            where: { id },
            select: {
                id: true,
                email: true,
                username: true,
                role: true,
                biography: true,
                favorite_band: true,
                created_at: true,
            },
        });

        if (!user) throw new NotFound('User not found');
        return user;
    }

    async update(id: string, data: any) {
        try {
            return await prisma.user.update({
                where: { id },
                data,
                select: {
                    id: true,
                    email: true,
                    username: true,
                    role: true,
                    updated_at: true,
                },
            });
        } catch {
            throw new NotFound('User not found');
        }
    }

    async delete(id: string) {
        try {
            return await prisma.user.delete({
                where: { id },
                select: {
                    id: true,
                    email: true,
                    username: true,
                },
            });
        } catch {
            throw new NotFound('User not found');
        }
    }
}

export const userService = new UserService();
