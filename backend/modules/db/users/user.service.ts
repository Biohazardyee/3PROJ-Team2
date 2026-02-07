import {PrismaDb} from '../../../config/database.js';
import {NotFound, BadRequest} from '../../../utils/errors.js';
import {isValidStringLength, isEmptyString} from "../../../utils/helpers.js";
import {isValidEmail, isValidUsername, isValidPassword} from "./user.helper.js";
import {Prisma} from '../../../generated/prisma/client.js';
import bcrypt from "bcrypt";
import {
    PartialUserResponseDto,
    SelectableUserField,
    UserRegistrationDto,
    UserResponseAddDto,
    UserResponseDeleteDto,
    UserResponseDto,
    UserUpdateDto
} from "../../../types/users/user.dto.js";
import {User} from "../../../generated/prisma/browser.js";
import {userMapper} from "../../../mappers/users/user.mapper.js";

export class UserService {

    async add(data: UserRegistrationDto): Promise<UserResponseAddDto> {

        if (isEmptyString(data.email)) {
            throw new BadRequest("Email cannot be empty");
        }

        if (isEmptyString(data.username)) {
            throw new BadRequest("Username cannot be empty");
        }

        if (isEmptyString(data.password)) {
            throw new BadRequest("Password cannot be empty");
        }

        if (isEmptyString(data.favorite_band)) {
            throw new BadRequest("Favorite band cannot be empty");
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

        const email: string = data.email.trim().toLowerCase();
        const username: string = data.username.trim();
        const hashedPassword: string = await bcrypt.hash(data.password, 10);

        const exist = await PrismaDb.user.findFirst({
            where: {
                OR: [
                    {email},
                    {username},
                ],
            },
        });

        if (exist) {
            throw new BadRequest('Email or username already in use');
        }

        const createData: Prisma.UserCreateInput = {
            email,
            username,
            password: hashedPassword,
            favorite_band: data.favorite_band,
            profile_picture: data.profile_picture,
        };

        const user = await PrismaDb.user.create({
            data: createData,
        });

        return userMapper.toAddDto(user);
    }

    async getAll(): Promise<UserResponseDto[]> {
        const users: User[] = await PrismaDb.user.findMany({
            orderBy: {
                created_at: 'desc'
            }
        });

        return userMapper.toDtoList(users);
    }

    /**
     * Récupère plusieurs utilisateurs avec seulement les champs spécifiés
     */
    async getAllWithFields(fields: SelectableUserField[]): Promise<PartialUserResponseDto[]> {

        if (!fields || fields.length === 0) {
            throw new BadRequest('At least one field must be specified');
        }

        const allowedFields: SelectableUserField[] = [
            'id',
            'email',
            'username',
            'role',
            'phone_number',
            'biography',
            'favorite_band',
            'has_notifications',
            'profile_picture',
            'created_at',
            'updated_at',
        ];

        const invalidFields: SelectableUserField[] = fields.filter(field => !allowedFields.includes(field));
        if (invalidFields.length > 0) {
            throw new BadRequest(`Invalid fields: ${invalidFields.join(', ')}`);
        }

        const select: Prisma.UserSelect = {};
        fields.forEach(field => {
            select[field] = true;
        });

        const users = await PrismaDb.user.findMany({
            select,
            orderBy: {
                created_at: 'desc'
            }
        });

        return users as PartialUserResponseDto[];
    }

    async getById(id: string): Promise<UserResponseDto> {

        if (isEmptyString(id)) {
            throw new BadRequest('User id cannot be empty');
        }

        const user: User | null = await PrismaDb.user.findUnique({
            where: {
                id
            },
        });

        if (!user) {
            throw new NotFound('User not found');
        }

        return userMapper.toDto(user);
    }

    /**
     * Récupère un utilisateur avec seulement les champs spécifiés
     */
    async getByIdWithFields(id: string, fields: SelectableUserField[]): Promise<PartialUserResponseDto> {

        if (isEmptyString(id)) {
            throw new BadRequest('User id cannot be empty');
        }

        if (!fields || fields.length === 0) {
            throw new BadRequest('At least one field must be specified');
        }

        const allowedFields: SelectableUserField[] = [
            'id',
            'email',
            'username',
            'role',
            'phone_number',
            'biography',
            'favorite_band',
            'has_notifications',
            'profile_picture',
            'created_at',
            'updated_at',
        ];

        const invalidFields: SelectableUserField[] = fields.filter(field => !allowedFields.includes(field));
        if (invalidFields.length > 0) {
            throw new BadRequest(`Invalid fields: ${invalidFields.join(', ')}`);
        }

        const select: Prisma.UserSelect = {};
        fields.forEach(field => {
            select[field] = true;
        });

        const user: User | null = await PrismaDb.user.findUnique({
            where: {
                id
            },
            select,
        });

        if (!user) {
            throw new NotFound('User not found');
        }

        return user as PartialUserResponseDto;
    }

    async update(id: string, data: UserUpdateDto): Promise<UserResponseDto> {

        if (isEmptyString(id)) {
            throw new BadRequest('User id cannot be empty');
        }

        const exist: User | null = await PrismaDb.user.findUnique({
            where: {
                id
            },
        });

        if (!exist) {
            throw new NotFound('User not found');
        }

        const updateData: Prisma.UserUpdateInput = {};

        if (data.email !== undefined) {
            if (isEmptyString(data.email)) {
                throw new BadRequest('Username cannot be empty');
            }
            if (!isValidEmail(data.email)) {
                throw new BadRequest('Email format is not correct');
            }

            const emailExist: User | null = await PrismaDb.user.findFirst({
                where: {
                    email: data.email.trim(),
                }
            });

            if (emailExist) {
                throw new BadRequest('This email is already in use');
            }

            updateData.email = data.email.trim();
        }

        if (data.username !== undefined) {
            if (isEmptyString(data.username)) {
                throw new BadRequest('Username cannot be empty');
            }
            if (!isValidUsername(data.username)) {
                throw new BadRequest(
                    'Username must be 3–30 chars and contain only letters, numbers, "_" or "-"'
                );
            }

            const usernameExists: User | null = await PrismaDb.user.findFirst({
                where: {
                    username: data.username.trim(),
                    NOT: {
                        id
                    }
                }
            });

            if (usernameExists) {
                throw new BadRequest('Username already in use');
            }

            updateData.username = data.username.trim();
        }

        if (data.password !== undefined) {
            if (isEmptyString(data.password)) {
                throw new BadRequest('Password cannot be empty');
            }
            if (!isValidPassword(data.password)) {
                throw new BadRequest(
                    'Password must be at least 8 characters and include uppercase, lowercase, number and special character'
                );
            }
            updateData.password = await bcrypt.hash(data.password, 10);
        }

        if (data.phone_number !== undefined) {
            updateData.phone_number = data.phone_number;
        }

        if (data.biography !== undefined) {
            if (data.biography && !isValidStringLength(data.biography, 255)) {
                throw new BadRequest('Biography is too long (max 255 chars)');
            }
            updateData.biography = data.biography;
        }

        if (data.favorite_band !== undefined) {
            updateData.favorite_band = data.favorite_band;
        }

        if (data.has_notifications !== undefined) {
            updateData.has_notifications = data.has_notifications;
        }

        if (data.profile_picture !== undefined) {
            updateData.profile_picture = data.profile_picture;
        }

        const user: User = await PrismaDb.user.update({
            where: {
                id
            },
            data: updateData,
        });

        return userMapper.toDto(user);
    }

    async delete(id: string): Promise<UserResponseDeleteDto> {

        if (isEmptyString(id)) {
            throw new BadRequest('User id cannot be empty');
        }

        try {
            const user: User = await PrismaDb.user.delete({
                where: {id},
            });

            return userMapper.toDeleteDto(user);

        } catch (error) {
            if (error instanceof Prisma.PrismaClientKnownRequestError) {
                if (error.code === 'P2025') {
                    throw new NotFound('User not found');
                }
            }
            throw error;
        }
    }

    /**
     * ✅ Méthode publique mais retourne le User complet (avec password)
     * Utilisée UNIQUEMENT pour l'authentification
     */
    async getByEmailForAuth(email: string): Promise<User | null> {
        if (isEmptyString(email)) {
            throw new BadRequest('Email cannot be empty');
        }

        return PrismaDb.user.findUnique({
            where: {
                email: email.trim().toLowerCase()
            }
        });
    }

    /**
     * ✅ Méthode sécurisée (sans password) pour les autres cas
     */
    async getByEmail(email: string): Promise<UserResponseDto> {
        if (isEmptyString(email)) {
            throw new BadRequest('Email cannot be empty');
        }

        const user: User | null = await PrismaDb.user.findUnique({
            where: {
                email: email.trim().toLowerCase()
            }
        });

        if (!user) {
            throw new BadRequest('User not found');
        }

        return userMapper.toDto(user);
    }
}

export const userService = new UserService();