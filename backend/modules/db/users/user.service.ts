import {PrismaDb} from "../../../config/database.js";
import {NotFound, BadRequest, Unauthorized} from "../../../utils/errors.js";
import {sendVerificationEmail, sendPasswordResetEmail} from "../../../utils/mailer.js";
import {
    generateTwoFactorQrCode,
    generateTwoFactorSecret,
    verifyTwoFactorToken,
    generateBackupCodes,
    normalizeBackupCode,
} from "../../../utils/twofa.js";
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
    UserResponseLoginDto,
    UserSearchResultDto,
    UserUpdateDto,
} from "../../../types/users/user.dto.js";

import {Users} from "../../../generated/prisma/browser.js";
import {userMapper} from "../../../mappers/users/user.mapper.js";
import {COSMETIC_SLOT_FIELDS, COSMETICS, CosmeticItem, CosmeticSlot, getCosmeticById} from "./cosmetics.catalog.js";
import {bufferToImageDataUri} from "../../../utils/imageDataUri.js";

const VERIFICATION_CODE_TTL_MS = 15 * 60 * 1000;

function generateVerificationCode(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

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

        const verificationCode: string = generateVerificationCode();

        const createData: Prisma.UsersCreateInput = {
            email,
            username,
            pseudo: data.pseudo.trim(),
            password: hashedPassword,
            favorite_band: data.favorite_band,
            profile_picture: data.profile_picture,
            email_verified: false,
            email_verification_code: verificationCode,
            email_verification_expires: new Date(Date.now() + VERIFICATION_CODE_TTL_MS),
        };

        const user: Users = await PrismaDb.users.create({
            data: createData,
        });

        try {
            await sendVerificationEmail(user.email, verificationCode);
        } catch (err) {
            // Le compte est créé même si l'email échoue : l'utilisateur pourra
            // toujours redemander un code via /users/resend-verification.
            console.error("❌ Échec de l'envoi de l'email de vérification:", err);
        }

        return userMapper.toAddDto(user);
    }

    async verifyEmail(email: string, code: string): Promise<UserResponseLoginDto> {
        if (isEmptyString(email) || isEmptyString(code)) {
            throw new BadRequest("Email and code are required");
        }

        const user: Users | null = await PrismaDb.users.findUnique({
            where: {email: email.trim().toLowerCase()},
        });

        if (!user) {
            throw new NotFound("User not found");
        }

        if (user.email_verified) {
            throw new BadRequest("Email already verified");
        }

        if (
            !user.email_verification_code ||
            user.email_verification_code !== code.trim() ||
            !user.email_verification_expires ||
            user.email_verification_expires.getTime() < Date.now()
        ) {
            throw new BadRequest("Invalid or expired verification code");
        }

        const verified: Users = await PrismaDb.users.update({
            where: {id: user.id},
            data: {
                email_verified: true,
                email_verification_code: null,
                email_verification_expires: null,
            },
        });

        return userMapper.toLoginDto(verified);
    }

    async resendVerificationCode(email: string): Promise<void> {
        if (isEmptyString(email)) {
            throw new BadRequest("Email is required");
        }

        const user: Users | null = await PrismaDb.users.findUnique({
            where: {email: email.trim().toLowerCase()},
        });

        if (!user) {
            throw new NotFound("User not found");
        }

        if (user.email_verified) {
            throw new BadRequest("Email already verified");
        }

        const verificationCode: string = generateVerificationCode();

        await PrismaDb.users.update({
            where: {id: user.id},
            data: {
                email_verification_code: verificationCode,
                email_verification_expires: new Date(Date.now() + VERIFICATION_CODE_TTL_MS),
            },
        });

        await sendVerificationEmail(user.email, verificationCode);
    }

    async requestPasswordReset(email: string): Promise<void> {
        if (isEmptyString(email)) {
            throw new BadRequest("Email is required");
        }

        const user: Users | null = await PrismaDb.users.findUnique({
            where: {email: email.trim().toLowerCase()},
        });

        if (!user) {
            throw new NotFound("User not found");
        }

        if (!user.password) {
            throw new BadRequest(
                "This account uses OAuth login, there is no password to reset",
            );
        }

        const resetCode: string = generateVerificationCode();

        await PrismaDb.users.update({
            where: {id: user.id},
            data: {
                password_reset_code: resetCode,
                password_reset_expires: new Date(Date.now() + VERIFICATION_CODE_TTL_MS),
            },
        });

        await sendPasswordResetEmail(user.email, resetCode);
    }

    async resetPassword(email: string, code: string, newPassword: string): Promise<void> {
        if (isEmptyString(email) || isEmptyString(code) || isEmptyString(newPassword)) {
            throw new BadRequest("Email, code and new password are required");
        }

        if (!isValidPassword(newPassword)) {
            throw new BadRequest(
                "Password must be at least 8 characters and include uppercase, lowercase, number and special character",
            );
        }

        const user: Users | null = await PrismaDb.users.findUnique({
            where: {email: email.trim().toLowerCase()},
        });

        if (!user) {
            throw new NotFound("User not found");
        }

        if (
            !user.password_reset_code ||
            user.password_reset_code !== code.trim() ||
            !user.password_reset_expires ||
            user.password_reset_expires.getTime() < Date.now()
        ) {
            throw new BadRequest("Invalid or expired reset code");
        }

        const hashedPassword: string = await bcrypt.hash(newPassword, 10);

        await PrismaDb.users.update({
            where: {id: user.id},
            data: {
                password: hashedPassword,
                password_reset_code: null,
                password_reset_expires: null,
            },
        });
    }

    async setupTwoFactor(userId: string): Promise<{ secret: string; qrCodeDataUri: string }> {
        const user: Users | null = await PrismaDb.users.findUnique({where: {id: userId}});
        if (!user) {
            throw new NotFound("User not found");
        }
        if (user.twofa_enabled) {
            throw new BadRequest("Two-factor authentication is already enabled");
        }

        const secret: string = generateTwoFactorSecret();

        // Stocké mais pas encore actif : ne devient "enabled" qu'après
        // confirmation d'un premier code valide (voir confirmTwoFactor).
        await PrismaDb.users.update({
            where: {id: userId},
            data: {twofa_secret: secret},
        });

        const qrCodeDataUri: string = await generateTwoFactorQrCode(user.email, secret);

        return {secret, qrCodeDataUri};
    }

    async confirmTwoFactor(userId: string, token: string): Promise<string[]> {
        if (isEmptyString(token)) {
            throw new BadRequest("Code is required");
        }

        const user: Users | null = await PrismaDb.users.findUnique({where: {id: userId}});
        if (!user) {
            throw new NotFound("User not found");
        }
        if (!user.twofa_secret) {
            throw new BadRequest("No two-factor setup in progress");
        }
        if (!verifyTwoFactorToken(token.trim(), user.twofa_secret)) {
            throw new BadRequest("Invalid verification code");
        }

        const backupCodes: string[] = generateBackupCodes();
        const hashedBackupCodes: string[] = await Promise.all(
            backupCodes.map((code): Promise<string> => bcrypt.hash(code, 10)),
        );

        await PrismaDb.users.update({
            where: {id: userId},
            data: {twofa_enabled: true, twofa_backup_codes: hashedBackupCodes},
        });

        return backupCodes;
    }

    async disableTwoFactor(userId: string, token: string): Promise<void> {
        if (isEmptyString(token)) {
            throw new BadRequest("Code is required");
        }

        const user: Users | null = await PrismaDb.users.findUnique({where: {id: userId}});
        if (!user) {
            throw new NotFound("User not found");
        }
        if (!user.twofa_enabled || !user.twofa_secret) {
            throw new BadRequest("Two-factor authentication is not enabled");
        }
        if (!verifyTwoFactorToken(token.trim(), user.twofa_secret)) {
            throw new BadRequest("Invalid verification code");
        }

        await PrismaDb.users.update({
            where: {id: userId},
            data: {twofa_enabled: false, twofa_secret: null, twofa_backup_codes: []},
        });
    }

    async regenerateBackupCodes(userId: string, token: string): Promise<string[]> {
        if (isEmptyString(token)) {
            throw new BadRequest("Code is required");
        }

        const user: Users | null = await PrismaDb.users.findUnique({where: {id: userId}});
        if (!user) {
            throw new NotFound("User not found");
        }
        if (!user.twofa_enabled || !user.twofa_secret) {
            throw new BadRequest("Two-factor authentication is not enabled");
        }
        // Exige un code TOTP de l'application (pas un code de secours), pour éviter
        // qu'un seul code de secours compromis permette d'en régénérer indéfiniment.
        if (!verifyTwoFactorToken(token.trim(), user.twofa_secret)) {
            throw new BadRequest("Invalid verification code");
        }

        const backupCodes: string[] = generateBackupCodes();
        const hashedBackupCodes: string[] = await Promise.all(
            backupCodes.map((code): Promise<string> => bcrypt.hash(code, 10)),
        );

        await PrismaDb.users.update({
            where: {id: userId},
            data: {twofa_backup_codes: hashedBackupCodes},
        });

        return backupCodes;
    }

    async verifyTwoFactorLogin(userId: string, token: string): Promise<Users> {
        if (isEmptyString(token)) {
            throw new BadRequest("Code is required");
        }

        const user: Users | null = await PrismaDb.users.findUnique({where: {id: userId}});
        if (!user || !user.twofa_enabled || !user.twofa_secret) {
            throw new BadRequest("Two-factor authentication is not enabled for this account");
        }

        if (verifyTwoFactorToken(token.trim(), user.twofa_secret)) {
            return user;
        }

        // Repli sur les codes de secours si le code TOTP est invalide/expiré.
        const normalized: string = normalizeBackupCode(token);
        if (normalized.length === 8) {
            for (let i = 0; i < user.twofa_backup_codes.length; i++) {
                const matches: boolean = await bcrypt.compare(normalized, user.twofa_backup_codes[i]);
                if (matches) {
                    const remainingCodes: string[] = [...user.twofa_backup_codes];
                    remainingCodes.splice(i, 1);

                    await PrismaDb.users.update({
                        where: {id: userId},
                        data: {twofa_backup_codes: remainingCodes},
                    });

                    return user;
                }
            }
        }

        throw new Unauthorized("Invalid verification code");
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

    async searchUsers(query: string, excludeUserId?: string): Promise<UserSearchResultDto[]> {
        const trimmed: string = (query || "").trim();
        if (trimmed.length < 2) return [];

        const users = await PrismaDb.users.findMany({
            where: {
                AND: [
                    excludeUserId ? {id: {not: excludeUserId}} : {},
                    {
                        OR: [
                            {username: {contains: trimmed, mode: "insensitive"}},
                            {pseudo: {contains: trimmed, mode: "insensitive"}},
                        ],
                    },
                ],
            },
            select: {id: true, username: true, pseudo: true, profile_picture: true},
            orderBy: {username: "asc"},
            take: 8,
        });

        return users.map((u): UserSearchResultDto => ({
            id: u.id,
            username: u.username,
            pseudo: u.pseudo,
            profile_picture: bufferToImageDataUri(u.profile_picture),
        }));
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

    async exportUserData(userId: string): Promise<Record<string, unknown>> {
        if (isEmptyString(userId)) {
            throw new BadRequest("User id is required");
        }

        const user = await PrismaDb.users.findUnique({
            where: {id: userId},
            include: {
                reviews: {
                    include: {media: {select: {api_id: true}}},
                    orderBy: {created_at: "desc"},
                },
                review_comments: {orderBy: {created_at: "desc"}},
                review_likes: {orderBy: {created_at: "desc"}},
                commentLikes: {orderBy: {created_at: "desc"}},
                playlists: {
                    include: {items: {include: {media: {select: {api_id: true}}}}},
                    orderBy: {created_at: "desc"},
                },
                follows: {
                    include: {follow_user: {select: {username: true}}},
                    orderBy: {created_at: "desc"},
                },
                followers: {
                    include: {user: {select: {username: true}}},
                    orderBy: {created_at: "desc"},
                },
                user_media_status: {
                    include: {media: {select: {api_id: true}}},
                    orderBy: {created_at: "desc"},
                },
                activities: {orderBy: {created_at: "desc"}},
                notifications: {orderBy: {created_at: "desc"}},
                conversations_user1: {
                    include: {
                        user2: {select: {username: true}},
                        messages: {orderBy: {created_at: "asc"}},
                    },
                },
                conversations_user2: {
                    include: {
                        user1: {select: {username: true}},
                        messages: {orderBy: {created_at: "asc"}},
                    },
                },
            },
        });

        if (!user) {
            throw new NotFound("User not found");
        }

        const conversations = [
            ...user.conversations_user1.map((c) => ({
                with: c.user2.username,
                created_at: c.created_at,
                messages: c.messages.map((m) => ({
                    content: m.content,
                    sender: m.sender_id === userId ? "me" : c.user2.username,
                    is_read: m.is_read,
                    created_at: m.created_at,
                })),
            })),
            ...user.conversations_user2.map((c) => ({
                with: c.user1.username,
                created_at: c.created_at,
                messages: c.messages.map((m) => ({
                    content: m.content,
                    sender: m.sender_id === userId ? "me" : c.user1.username,
                    is_read: m.is_read,
                    created_at: m.created_at,
                })),
            })),
        ];

        return {
            exported_at: new Date().toISOString(),
            profile: {
                id: user.id,
                username: user.username,
                pseudo: user.pseudo,
                email: user.email,
                phone_number: user.phone_number,
                biography: user.biography,
                favorite_band: user.favorite_band,
                role: user.role,
                shop_points: user.shop_points,
                owned_cosmetics: user.owned_cosmetics,
                equipped_avatar_border: user.equipped_avatar_border,
                equipped_font: user.equipped_font,
                equipped_title: user.equipped_title,
                equipped_text_effect: user.equipped_text_effect,
                equipped_banner: user.equipped_banner,
                equipped_pattern: user.equipped_pattern,
                has_notifications: user.has_notifications,
                provider: user.provider,
                created_at: user.created_at,
                updated_at: user.updated_at,
            },
            reviews: user.reviews.map((r) => ({
                media_api_id: r.media.api_id,
                rating: r.rating,
                title: r.title,
                content: r.content,
                created_at: r.created_at,
                updated_at: r.updated_at,
            })),
            review_comments: user.review_comments.map((c) => ({
                content: c.content,
                review_id: c.review_id,
                parent_id: c.parent_id,
                created_at: c.created_at,
            })),
            review_likes: user.review_likes.map((l) => ({
                review_id: l.review_id,
                created_at: l.created_at,
            })),
            comment_likes: user.commentLikes.map((l) => ({
                comment_id: l.comment_id,
                created_at: l.created_at,
            })),
            playlists: user.playlists.map((p) => ({
                name: p.name,
                is_public: p.is_public,
                created_at: p.created_at,
                items: p.items.map((i) => ({
                    media_api_id: i.media.api_id,
                    added_at: i.created_at,
                })),
            })),
            media_status: user.user_media_status.map((s) => ({
                media_api_id: s.media.api_id,
                status: s.status,
                created_at: s.created_at,
            })),
            following: user.follows.map((f) => ({
                username: f.follow_user.username,
                since: f.created_at,
            })),
            followers: user.followers.map((f) => ({
                username: f.user.username,
                since: f.created_at,
            })),
            activities: user.activities.map((a) => ({
                action: a.action,
                review_id: a.review_id,
                media_id: a.media_id,
                rating_from_user: a.rating_from_user,
                created_at: a.created_at,
            })),
            notifications_received: user.notifications.map((n) => ({
                action: n.action,
                is_read: n.is_read,
                created_at: n.created_at,
            })),
            conversations,
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
