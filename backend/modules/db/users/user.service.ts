import {prisma} from '../../../config/database.js';
import {NotFound, BadRequest} from '../../../utils/errors.js';
import {isValidStringLength, isEmptyString} from "../../../utils/helpers.js";
import {isValidEmail, isValidUsername, isValidPassword} from "./user.helper.js"
import {Role} from '../../../generated/prisma/enums.js';
import bcrypt from "bcrypt";

export class UserService {

    async add(data: {
        email: string,
        username: string,
        password: string,
        favorite_band: string,
        role?: Role,
        phone_number?: string,
        biography?: string,
        has_notifications?: boolean,
        created_at: Date,
    }) {

        if (isEmptyString(data.email)) {
            throw new BadRequest("Email cannot be empty");
        }

        if (isEmptyString(data.username)) {
            throw new BadRequest("Username cannot be empty");
        }

        if (isEmptyString(data.password)) {
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
            omit: {
                password: true
            }
        });

        if (exists) {
            throw new BadRequest('Email or username already in use');
        }

        return prisma.user.create({
            data,
            omit: {
                password: true
            }
        });
    }

    async getByEmail(email: string) {
        if (!isValidEmail(email)) {
            throw new BadRequest('Invalid email');
        }

        return prisma.user.findUnique({
            where: {
                email: email.toLowerCase()
            },
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

        const user = await prisma.user.findUnique({
            where: {
                id
            },
            omit: {
                password: true
            }
        });

        if (!user) throw new NotFound('User not found');

        return user;
    }

    async update(id: string, data: {
        email?: string,
        username?: string,
        password?: string,
        role?: Role,
        phone_number?: string,
        biography?: string,
        favorite_band?: string,
        has_notifications?: boolean,
    }) {

        const user = await prisma.user.findUnique({
            where: {
                id
            },
        });

        if (!user) {
            throw new NotFound('User not found');
        }

        const allowedFields = [
            'email',
            'username',
            'password',
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

        if (data.role && !data.role.includes('BASIC') && !data.role.includes('ADMIN')) {
            throw new BadRequest('Role need to have a role between BASIC and ADMIN');
        }

        try {
            return await prisma.user.update({
                where: {
                    id
                },
                data,
                omit: {
                    password: true,
                }
            });
        } catch {
            throw new NotFound('User not found');
        }
    }

    async delete(id: string) {
        try {
            return await prisma.user.delete({
                where: {
                    id
                },
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
