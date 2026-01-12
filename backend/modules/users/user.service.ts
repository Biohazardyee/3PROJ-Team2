import {prisma} from '../../config/database.js';
import {NotFound, BadRequest} from '../../utils/errors.js';
import {isValidStringLength, isNonEmptyString} from "../../utils/helpers.js";
import {isValidEmail, isValidUsername, isValidPassword} from "./user.helper.js"
import bcrypt from "bcrypt";

export class UserService {

    async create(data: any) {

        if (!isNonEmptyString(data.email)) {
            throw new BadRequest("Email cannot be empty");
        }

        if (!isNonEmptyString(data.username)) {
            throw new BadRequest("Username cannot be empty");
        }

        if (!isNonEmptyString(data.password)) {
            throw new BadRequest("Password cannot be empty");
        }

        if (!isValidEmail(data.email)) {
            throw new BadRequest('Invalid email format');
        }

        if (!isValidUsername(data.username)) {
            throw new BadRequest(
                'Username must be 3–30 chars and contain only letters, numbers, "_" or "-"'
            );
        }

        if (!isValidPassword(data.password)) {
            throw new BadRequest(
                'Password must be at least 8 characters and include uppercase, lowercase, number and special character'
            );
        }

        data.email = data.email.trim().toLowerCase();
        data.username = data.username.trim();

        data.password = await bcrypt.hash(data.password, 10);

        const exists = await prisma.user.findFirst({
            where: {
                OR: [
                    {email: data.email},
                    {username: data.username},
                ],
            },
        });

        if (exists) {
            throw new BadRequest('Email or username already in use');
        }

        return prisma.user.create({
            data,
        });
    }

    async getByEmail(email: string) {
        if (!email || !isValidEmail(email)) {
            throw new BadRequest('Invalid email');
        }

        return prisma.user.findUnique({
            where: {email: email.toLowerCase()},
        });
    }

    async getAll() {
        return prisma.user.findMany({
            omit: {
                password: true
            },
        });
    }

    async getById(id: string) {
        if (!id) {
            throw new BadRequest('User id is required');
        }

        const user = await prisma.user.findUnique({
            where: {id},
            select: {
                id: true,
                email: true,
                username: true,
                role: true,
                profile_picture: true,
                phone_number: true,
                biography: true,
                favorite_band: true,
                has_notifications: true,
                created_at: true,
                updated_at: true,
            },
        });

        if (!user) throw new NotFound('User not found');
        return user;
    }

    async update(id: string, data: any) {
        if (!id) {
            throw new BadRequest('User id is required');
        }

        const allowedFields = [
            'email',
            'username',
            'biography',
            'favorite_band',
            'has_notifications',
            'role',
            'profile_picture',
            'phone_number',
        ];

        for (const key of Object.keys(data)) {
            if (!allowedFields.includes(key)) {
                throw new BadRequest(`Field "${key}" cannot be updated`);
            }
        }

        if (data.email && !isValidEmail(data.email)) {
            throw new BadRequest('Invalid email format');
        }

        if (data.username && !isValidUsername(data.username)) {
            throw new BadRequest('Invalid username format');
        }

        if (data.biography && !isValidStringLength(data.biography, 500)) {
            throw new BadRequest('Biography is too long (max 500 chars)');
        }

        if (data.favorite_band && !isValidStringLength(data.favorite_band, 100)) {
            throw new BadRequest('Favorite band is too long (max 100 chars)');
        }

        if (data.role && !data.role.equals('BASIC') && !data.role.equals('ADMIN')) {
            throw new BadRequest('Role need to have a role between BASIC and ADMIN');
        }

        try {
            return await prisma.user.update({
                where: {id},
                data,
                select: {
                    id: true,
                    email: true,
                    username: true,
                    role: true,
                    profile_picture: true,
                    phone_number: true,
                    biography: true,
                    favorite_band: true,
                    has_notifications: true,
                    created_at: true,
                    updated_at: true,
                },
            });
        } catch {
            throw new NotFound('User not found');
        }
    }

    async delete(id: string) {
        if (!id) {
            throw new BadRequest('User id is required');
        }

        try {
            return await prisma.user.delete({
                where: {id},
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
