import { CreateUserInput, UpdateUserInput, PublicUser, PublicUserDto } from './user.dto';
import { NotFound } from '../../utils/errors';
import { prisma } from '../../config/database.js'

export class UserService {

    async create(data: CreateUserInput): Promise<PublicUser> {
        const user = await prisma.user.create({
            data
        });
        return PublicUserDto.parse(user);
    }

    async getAll(): Promise<PublicUser[]> {
        const users = await prisma.user.findMany({
            select: {
                id: true,
                email: true,
                username: true,
                phone_number: true,
                role: true,
                profile_picture: true,
                biography: true,
                favorite_band: true,
                has_notifications: true,
                created_at: true,
                updated_at: true,
            },
        });

        return users.map(u => PublicUserDto.parse(u));
    }

    async getById(id: string): Promise<PublicUser> {
        const user = await prisma.user.findUnique({
            where: { id },
        });

        if (!user) throw new NotFound('User not found');

        return PublicUserDto.parse(user);
    }

    async update(id: string, data: UpdateUserInput): Promise<PublicUser> {
        const exists = await prisma.user.findUnique({ where: { id } });
        if (!exists) throw new NotFound('User not found');

        const updated = await prisma.user.update({
            where: { id },
            data,
        });

        return PublicUserDto.parse(updated);
    }

    async delete(id: string): Promise<PublicUser> {
        const exists = await prisma.user.findUnique({ where: { id } });
        if (!exists) throw new NotFound('User not found');

        const deleted = await prisma.user.delete({ where: { id } });
        return PublicUserDto.parse(deleted);
    }
}

export const userService = new UserService();
