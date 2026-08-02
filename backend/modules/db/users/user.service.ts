import {PrismaDb} from "../../../config/database.js";
import {NotFound, BadRequest} from "../../../utils/errors.js";
import {
    isValidStringLength,
    isEmptyString,
    isValidBoolean,
} from "../../../utils/helpers.js";
import {
    isValidEmail,
    isValidUsername,
    isValidPassword,
    generateUniqueUsername,
    checkIfNotBanned,
} from "./user.helper.js";
import {
    Prisma,
} from "../../../generated/prisma/client.js";
import bcrypt from "bcrypt";
import {
    OAuthUserDto,
    PartialUserResponseDto,
    SelectableUserField,
    UserPublicDto,
    UserRegistrationDto,
    UserResponseAddDto,
    UserResponseDeleteDto,
    UserResponseDto,
    UserUpdateDto,
} from "../../../types/users/user.dto.js";

import {Users} from "../../../generated/prisma/browser.js";
import {userMapper} from "../../../mappers/users/user.mapper.js";
import {COSMETIC_SLOT_FIELDS, COSMETICS, CosmeticItem, CosmeticSlot, getCosmeticById} from "./cosmetics.catalog.js";

export class UserService {
    async add(data: UserRegistrationDto): Promise<UserResponseAddDto> {
        if (isEmptyString(data.email)) {
            throw new BadRequest("Email cannot be empty");
        }

        if (isEmptyString(data.username)) {
            throw new BadRequest("Username cannot be empty");
        }

        if (isEmptyString(data.pseudo)) {
            throw new BadRequest("Pseudo cannot be empty");
        }

        if (!isValidStringLength(data.pseudo, 30)) {
            throw new BadRequest("Pseudo is too long (max 30 chars)");
        }

        if (isEmptyString(data.password)) {
            throw new BadRequest("Password cannot be empty");
        }


        if (!isValidEmail(data.email)) {
            throw new BadRequest("Invalid email format");
        }

        if (!isValidUsername(data.username)) {
            throw new BadRequest(
                'Username must be 3–30 chars and contain only letters, numbers, "_" or "-"',
            );
        }

        if (!isValidPassword(data.password)) {
            throw new BadRequest(
                "Password must be at least 8 characters and include uppercase, lowercase, number and special character",
            );
        }

        await checkIfNotBanned(data.email);

        const email: string = data.email.trim().toLowerCase();
        const username: string = data.username.trim();
        const hashedPassword: string = await bcrypt.hash(data.password, 10);

        const exist: Users | null = await PrismaDb.users.findFirst({
            where: {
                OR: [{email}, {username}],
            },
        });

        if (exist) {
            throw new BadRequest("Email or username already in use");
        }

        const createData: Prisma.UsersCreateInput = {
            email,
            username,
            pseudo: data.pseudo.trim(),
            password: hashedPassword,
            favorite_band: data.favorite_band,
            profile_picture: data.profile_picture,
        };

        const user: Users = await PrismaDb.users.create({
            data: createData,
        });

        return userMapper.toAddDto(user);
    }

    /**
     *  fusionne ou crée un utilisateur OAuth
     */
    async findOrCreateOAuthUser(data: OAuthUserDto): Promise<UserResponseDto> {
        try {
            await checkIfNotBanned(data.email);

            const existing: Users | null = await PrismaDb.users.findUnique({
                where: {
                    provider_provider_id: {
                        provider: data.provider,
                        provider_id: data.provider_id,
                    },
                },
            });

            if (existing) {
                console.log("User already exists with this provider account");
                return userMapper.toDto(existing);
            }

            const emailConflict: Users | null = await PrismaDb.users.findUnique({
                where: {email: data.email},
            });

            if (emailConflict) {
                console.log(
                    `[OAuth Fusion] Email match found for ${data.email}. Linking ${data.provider} to this account.`,
                );

                const mergedUser: Users = await PrismaDb.users.update({
                    where: {id: emailConflict.id},
                    data: {
                        provider: data.provider,
                        provider_id: data.provider_id,
                    },
                });

                return userMapper.toDto(mergedUser);
            }

            const username: string = await generateUniqueUsername(
                data.username || data.email.split("@")[0],
            );

            const newUser: Users = await PrismaDb.users.create({
                data: {
                    email: data.email,
                    username,
                    pseudo: username,
                    password: null,
                    provider: data.provider,
                    provider_id: data.provider_id,
                },
            });

            return userMapper.toDto(newUser);
        } catch (err) {
            console.error("❌ Error in findOrCreateOAuthUser:", err);
            throw err;
        }
    }

    async getAll(): Promise<UserResponseDto[]> {
        const users: Users[] = await PrismaDb.users.findMany({
            orderBy: {
                created_at: "desc",
            },
        });

        return userMapper.toDtoList(users);
    }

    /**
     * Récupère plusieurs utilisateurs avec seulement les champs spécifiés
     */
    async getAllWithFields(
        fields: SelectableUserField[],
    ): Promise<PartialUserResponseDto[]> {
        if (!fields || fields.length === 0) {
            throw new BadRequest("At least one field must be specified");
        }

        const allowedFields: SelectableUserField[] = [
            "id",
            "email",
            "username",
            "pseudo",
            "role",
            "phone_number",
            "biography",
            "favorite_band",
            "has_notifications",
            "profile_picture",
            "banner",
            "created_at",
            "updated_at",
        ];

        const invalidFields: SelectableUserField[] = fields.filter(
            (field): boolean => !allowedFields.includes(field),
        );
        if (invalidFields.length > 0) {
            throw new BadRequest(`Invalid fields: ${invalidFields.join(", ")}`);
        }

        const select: Prisma.UsersSelect = {};
        fields.forEach((field): void => {
            select[field] = true;
        });

        const users: Users[] = await PrismaDb.users.findMany({
            select,
            orderBy: {
                created_at: "desc",
            },
        });

        return users as PartialUserResponseDto[];
    }

    async getProfile(id: string): Promise<UserPublicDto> {
        if (isEmptyString(id)) {
            throw new BadRequest("User id is missing from token");
        }

        const user: Users | null = await PrismaDb.users.findUnique({
            where: {id},
        });

        if (!user) {
            throw new NotFound("Profile not found");
        }

        return userMapper.toPublicDto(user);
    }

    async getById(id: string): Promise<UserResponseDto> {
        if (isEmptyString(id)) {
            throw new BadRequest("User id cannot be empty");
        }

        const user: Users | null = await PrismaDb.users.findUnique({
            where: {
                id,
            },
        });

        if (!user) {
            throw new NotFound("User not found");
        }

        return userMapper.toDto(user);
    }

    /**
     * Récupère un utilisateur avec seulement les champs spécifiés
     */
    async getByIdWithFields(
        id: string,
        fields: SelectableUserField[],
    ): Promise<PartialUserResponseDto> {
        if (isEmptyString(id)) {
            throw new BadRequest("User id cannot be empty");
        }

        if (!fields || fields.length === 0) {
            throw new BadRequest("At least one field must be specified");
        }

        const allowedFields: SelectableUserField[] = [
            "id",
            "email",
            "username",
            "pseudo",
            "role",
            "phone_number",
            "biography",
            "favorite_band",
            "has_notifications",
            "profile_picture",
            "banner",
            "created_at",
            "updated_at",
        ];

        const invalidFields: SelectableUserField[] = fields.filter(
            (field): boolean => !allowedFields.includes(field),
        );
        if (invalidFields.length > 0) {
            throw new BadRequest(`Invalid fields: ${invalidFields.join(", ")}`);
        }

        const select: Prisma.UsersSelect = {};
        fields.forEach((field: SelectableUserField): void => {
            select[field] = true;
        });

        const user: Users | null = await PrismaDb.users.findUnique({
            where: {
                id,
            },
            select,
        });

        if (!user) {
            throw new NotFound("User not found");
        }

        return user as PartialUserResponseDto;
    }

    async update(id: string, data: UserUpdateDto): Promise<UserResponseDto> {
        if (isEmptyString(id)) {
            throw new BadRequest("User id cannot be empty");
        }

        const exist: Users | null = await PrismaDb.users.findUnique({
            where: {
                id,
            },
        });

        if (!exist) {
            throw new NotFound("User not found");
        }

        const updateData: Prisma.UsersUpdateInput = {};

        if (data.email !== undefined) {
            if (isEmptyString(data.email)) {
                throw new BadRequest("Username cannot be empty");
            }
            if (!isValidEmail(data.email)) {
                throw new BadRequest("Email format is not correct");
            }

            const emailExist: Users | null = await PrismaDb.users.findFirst({
                where: {
                    email: data.email.trim(),
                },
            });

            if (emailExist) {
                throw new BadRequest("This email is already in use");
            }

            updateData.email = data.email.trim();
        }

        if (data.username !== undefined) {
            if (isEmptyString(data.username)) {
                throw new BadRequest("Username cannot be empty");
            }
            if (!isValidUsername(data.username)) {
                throw new BadRequest(
                    'Username must be 3–30 chars and contain only letters, numbers, "_" or "-"',
                );
            }

            const usernameExists: Users | null = await PrismaDb.users.findFirst({
                where: {
                    username: data.username.trim(),
                    NOT: {
                        id,
                    },
                },
            });

            if (usernameExists) {
                throw new BadRequest("Username already in use");
            }

            updateData.username = data.username.trim();
        }

        if (data.pseudo !== undefined) {
            if (isEmptyString(data.pseudo)) {
                throw new BadRequest("Pseudo cannot be empty");
            }
            if (!isValidStringLength(data.pseudo, 30)) {
                throw new BadRequest("Pseudo is too long (max 30 chars)");
            }
            updateData.pseudo = data.pseudo.trim();
        }

        if (data.password !== undefined) {
            const oldPassword: string | undefined = data.oldPassword;
            if (!oldPassword) {
                throw new BadRequest("L'ancien mot de passe est requis.");
            }

            const user = await PrismaDb.users.findUnique({where: {id}});
            if (!user) throw new NotFound("Utilisateur non trouvé");

            if (!user.password) {
                throw new BadRequest("L'utilisateur n'a pas de mot de passe défini.");
            }

            const isMatch: boolean = await bcrypt.compare(oldPassword, user.password);

            if (!isMatch) {
                throw new BadRequest("L'ancien mot de passe est incorrect.");
            }

            if (isEmptyString(data.password)) {
                throw new BadRequest("Le nouveau mot de passe ne peut pas être vide");
            }
            if (!isValidPassword(data.password)) {
                throw new BadRequest("Format de mot de passe invalide");
            }

            updateData.password = await bcrypt.hash(data.password, 10);
        }

        if (data.phone_number !== undefined) {
            if (data.phone_number && isEmptyString(data.phone_number)) {
                throw new BadRequest("Phone numer cannot be empty");
            }
            updateData.phone_number = data.phone_number;
        }

        if (data.biography !== undefined) {
            if (data.biography && !isValidStringLength(data.biography, 255)) {
                throw new BadRequest("Biography is too long (max 255 chars)");
            }
            updateData.biography = data.biography;
        }

        if (data.favorite_band !== undefined) {
            if (data.favorite_band && isEmptyString(data.favorite_band)) {
                throw new BadRequest("Favorite band cannot be empty");
            }
            updateData.favorite_band = data.favorite_band;
        }

        if (data.has_notifications !== undefined) {
            if (isValidBoolean(data.has_notifications)) {
                throw new BadRequest("Has_notifications must be a boolean value");
            }
            updateData.has_notifications = data.has_notifications;
        }

        if (data.profile_picture !== undefined && data.profile_picture !== null) {
            let base64 = data.profile_picture;
            if (base64.startsWith("data:")) {
                base64 = base64.split(",")[1];
            }
            updateData.profile_picture = Buffer.from(base64, "base64");
        } else if (data.profile_picture === null) {
            updateData.profile_picture = null;
        }

        if (data.banner !== undefined && data.banner !== null) {
            let base64 = data.banner;
            if (base64.startsWith("data:")) {
                base64 = base64.split(",")[1];
            }
            updateData.banner = Buffer.from(base64, "base64");
        } else if (data.banner === null) {
            updateData.banner = null;
        }

        const user: Users = await PrismaDb.users.update({
            where: {
                id,
            },
            data: updateData,
        });

        return userMapper.toDto(user);
    }

    async delete(id: string): Promise<UserResponseDeleteDto> {
        if (isEmptyString(id)) {
            throw new BadRequest("User id cannot be empty");
        }

        try {
            const user: Users | null = await PrismaDb.users.findUnique({
                where: {
                    id,
                },
            });

            if (!user) {
                throw new NotFound("User not found");
            }

            const userToDelete: Users = await PrismaDb.users.delete({
                where: {
                    id,
                },
            });

            return userMapper.toDeleteDto(userToDelete);
        } catch (error) {
            if (error instanceof Prisma.PrismaClientKnownRequestError) {
                if (error.code === "P2025") {
                    throw new NotFound("User not found");
                }
            }
            throw error;
        }
    }

    async getByEmailForAuth(email: string): Promise<Users | null> {
        if (isEmptyString(email)) {
            throw new BadRequest("Email cannot be empty");
        }

        const cleanedEmail = email.trim().toLowerCase();

        await checkIfNotBanned(cleanedEmail);

        return PrismaDb.users.findUnique({
            where: {
                email: email.trim().toLowerCase(),
            },
        });
    }

    async getByEmail(email: string): Promise<UserResponseDto> {
        if (isEmptyString(email)) {
            throw new BadRequest("Email cannot be empty");
        }

        const user: Users | null = await PrismaDb.users.findUnique({
            where: {
                email: email.trim().toLowerCase(),
            },
        });

        if (!user) {
            throw new BadRequest("User not found");
        }

        return userMapper.toDto(user);
    }

    async updateProfile(
        id: string,
        data: Partial<UserUpdateDto>,
    ): Promise<UserPublicDto> {
        if (isEmptyString(id)) {
            throw new BadRequest("User id cannot be empty");
        }

        const exist = await PrismaDb.users.findUnique({
            where: {id},
        });

        if (!exist) {
            throw new NotFound("User not found");
        }

        const updateData: Prisma.UsersUpdateInput = {};

        if (data.username !== undefined) {
            if (isEmptyString(data.username)) {
                throw new BadRequest("Username cannot be empty");
            }
            if (!isValidUsername(data.username)) {
                throw new BadRequest("Username format is invalid");
            }

            const usernameExists = await PrismaDb.users.findFirst({
                where: {
                    username: data.username.trim(),
                    NOT: {id},
                },
            });
            if (usernameExists) throw new BadRequest("Username already in use");

            updateData.username = data.username.trim();
        }

        if (data.pseudo !== undefined) {
            if (isEmptyString(data.pseudo)) {
                throw new BadRequest("Pseudo cannot be empty");
            }
            if (!isValidStringLength(data.pseudo, 30)) {
                throw new BadRequest("Pseudo is too long (max 30 chars)");
            }
            updateData.pseudo = data.pseudo.trim();
        }

        if (data.favorite_band !== undefined) {
            if (isEmptyString(data.favorite_band)) {
                throw new BadRequest("Favorite band cannot be empty");
            }
            updateData.favorite_band = data.favorite_band;
        }

        if (data.biography !== undefined) updateData.biography = data.biography;

        if (data.profile_picture !== undefined && data.profile_picture !== null) {
            let base64 = data.profile_picture;
            if (base64.startsWith("data:")) {
                base64 = base64.split(",")[1];
            }
            updateData.profile_picture = Buffer.from(base64, "base64");
        }

        if (data.banner !== undefined && data.banner !== null) {
            let base64 = data.banner;
            if (base64.startsWith("data:")) {
                base64 = base64.split(",")[1];
            }
            updateData.banner = Buffer.from(base64, "base64");
        } else if (data.banner === null) {
            updateData.banner = null;
        }

        const updatedUser = await PrismaDb.users.update({
            where: {id},
            data: updateData,
        });

        return userMapper.toPublicDto(updatedUser);
    }

    getCosmeticsCatalog(): CosmeticItem[] {
        return COSMETICS;
    }

    async buyCosmetic(
        userId: string,
        cosmeticId: string,
    ): Promise<{ shop_points: number; owned_cosmetics: string[] }> {
        if (isEmptyString(userId) || isEmptyString(cosmeticId)) {
            throw new BadRequest("User id and cosmetic id are required");
        }

        const cosmetic = getCosmeticById(cosmeticId);
        if (!cosmetic) {
            throw new BadRequest("Unknown cosmetic");
        }

        const user = await PrismaDb.users.findUnique({where: {id: userId}});
        if (!user) {
            throw new NotFound("User not found");
        }

        if (user.owned_cosmetics.includes(cosmeticId)) {
            throw new BadRequest("Cosmetic already owned");
        }

        if (user.shop_points < cosmetic.price) {
            throw new BadRequest("Not enough shop points");
        }

        const updated = await PrismaDb.users.update({
            where: {id: userId},
            data: {
                shop_points: {decrement: cosmetic.price},
                owned_cosmetics: {push: cosmeticId},
            },
        });

        return {
            shop_points: updated.shop_points,
            owned_cosmetics: updated.owned_cosmetics,
        };
    }

    async equipCosmetic(
        userId: string,
        cosmeticId: string | null,
        slot: CosmeticSlot = "avatar_border",
    ): Promise<{
        equipped_avatar_border: string | null;
        equipped_font: string | null;
        equipped_title: string | null;
        equipped_text_effect: string | null;
        equipped_banner: string | null;
        equipped_pattern: string | null;
    }> {
        if (isEmptyString(userId)) {
            throw new BadRequest("User id is required");
        }

        const user = await PrismaDb.users.findUnique({where: {id: userId}});
        if (!user) {
            throw new NotFound("User not found");
        }

        if (cosmeticId !== null && cosmeticId !== "") {
            const cosmetic = getCosmeticById(cosmeticId);
            if (!cosmetic) {
                throw new BadRequest("Unknown cosmetic");
            }
            if (cosmetic.type !== slot) {
                throw new BadRequest("Cosmetic type does not match the requested slot");
            }
            if (!user.owned_cosmetics.includes(cosmeticId)) {
                throw new BadRequest("You don't own this cosmetic");
            }
        }

        const field = COSMETIC_SLOT_FIELDS[slot];

        const updated = await PrismaDb.users.update({
            where: {id: userId},
            data: {[field]: cosmeticId || null},
        });

        return {
            equipped_avatar_border: updated.equipped_avatar_border,
            equipped_font: updated.equipped_font,
            equipped_title: updated.equipped_title,
            equipped_text_effect: updated.equipped_text_effect,
            equipped_banner: updated.equipped_banner,
            equipped_pattern: updated.equipped_pattern,
        };
    }

    async updatePushToken(id: string, token: string): Promise<void> {
        if (isEmptyString(id) || isEmptyString(token)) {
            throw new BadRequest("User ID and token are required");
        }

        await PrismaDb.users.update({
            where: {id},
            data: {expo_push_token: token},
        });
    }
}

export const userService = new UserService();
