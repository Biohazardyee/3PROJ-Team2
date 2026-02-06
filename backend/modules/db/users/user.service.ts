import {PrismaDb} from '../../../config/database.js';
import {NotFound, BadRequest} from '../../../utils/errors.js';
import {isValidStringLength, isEmptyString} from "../../../utils/helpers.js";
import {isValidEmail, isValidUsername, isValidPassword} from "./user.helper.js"
import {Role} from '../../../generated/prisma/enums.js';
import {Prisma} from '../../../generated/prisma/client.js';
import bcrypt from "bcrypt";
import {UserWithoutPassword} from "../../../types/user.dto";
import {User} from "../../../generated/prisma/browser.js";

export class UserService {

    async add(data: Prisma.UserCreateInput): Promise<UserWithoutPassword> {

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

        const exist: UserWithoutPassword | null = await PrismaDb.user.findFirst({
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

        if (exist) {
            throw new BadRequest('Email or username already in use');
        }

        return PrismaDb.user.create({
            data,
            omit: {
                password: true
            }
        });
    }

    async getByEmail(email: string): Promise<User | null>  {
        if (!isValidEmail(email)) {
            throw new BadRequest('Invalid email');
        }

        return PrismaDb.user.findUnique({
            where: {
                email: email.toLowerCase()
            },
        });
    }

    async getAll(): Promise<UserWithoutPassword[]> {
        return PrismaDb.user.findMany({
            omit: {
                password: true
            },
        });
    }

    async getById(id: string): Promise<UserWithoutPassword> {

        const user = await PrismaDb.user.findUnique({
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

    async update(id: string, data: Prisma.UserUpdateInput): Promise<UserWithoutPassword> {

        const user: User | null = await PrismaDb.user.findUnique({
            where: {
                id
            },
        });

        if (!user) {
            throw new NotFound('User not found');
        }

        const allowedFields: string[] = [
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

        if (data.email && !isValidEmail((data.email).toString())) {
            throw new BadRequest('Invalid email format');
        }

        if (data.username && !isValidUsername((data.username).toString())) {
            throw new BadRequest('Invalid username format');
        }

        if (data.biography && !isValidStringLength((data.biography).toString(), 500)) {
            throw new BadRequest('Biography is too long (max 500 chars)');
        }

        if (data.favorite_band && !isValidStringLength((data.favorite_band).toString(), 100)) {
            throw new BadRequest('Favorite band is too long (max 100 chars)');
        }

        if (data.role && data.role != Role.BASIC && data.role != Role.ADMIN) {
            throw new BadRequest('Role need to have a role between BASIC and ADMIN');
        }

        try {
            return await PrismaDb.user.update({
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

    async delete(id: string): Promise<Partial<User>>{
        try {
            return await PrismaDb.user.delete({
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
