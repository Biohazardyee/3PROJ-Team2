import type {Request, Response, NextFunction} from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

import {Controller} from "../../controller.js";
import {Unauthorized, BadRequest, Forbidden} from "../../../utils/errors.js";
import {UserService, userService} from "./user.service.js";
import {userMapper} from "../../../mappers/users/user.mapper.js";
import {COSMETIC_SLOT_FIELDS, CosmeticSlot} from "./cosmetics.catalog.js";

import type {
    SelectableUserField,
    PartialUserResponseDto, UserPublicDto,
} from "../../../types/users/user.dto.js";

import {
    LoginDto,
    UserRegistrationDto,
    UserResponseAddDto,
    UserResponseDeleteDto,
    UserResponseDto,
    UserResponseLoginDto,
    UserSearchResultDto,
    UserUpdateDto,
} from "../../../types/users/user.dto.js";
import {Users} from "../../../generated/prisma/client.js";

dotenv.config();

class UserController extends Controller {
    constructor(private readonly service: UserService = userService) {
        super();
    }

    async add(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const registrationData: UserRegistrationDto = {
                email: req.body.email,
                username: req.body.username,
                pseudo: req.body.pseudo,
                password: req.body.password,
                favorite_band: req.body.favorite_band,
                profile_picture: req.body.profile_picture,
            };

            if (
                !registrationData.email ||
                !registrationData.username ||
                !registrationData.pseudo ||
                !registrationData.password
            ) {
                throw new BadRequest(
                    "Email, username, pseudo & password are required",
                );
            }

            const user: UserResponseAddDto = await this.service.add(registrationData);

            // Pas de token ici : le compte doit d'abord être vérifié par email
            // (voir /users/verify-email) avant de pouvoir se connecter.
            res.status(201).json({
                message: "User created successfully, verification email sent",
                requiresEmailVerification: true,
                user,
            });
        } catch (err) {
            next(err);
        }
    }

    async verifyEmail(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const {email, code} = req.body;

            if (!email || !code) {
                throw new BadRequest("Email and code are required");
            }

            const user = await this.service.verifyEmail(email, code);
            const token: string = this.signAuthToken(user);

            res.status(200).json({
                message: "Email verified successfully",
                token,
                user,
            });
        } catch (err) {
            next(err);
        }
    }

    async resendVerification(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const {email} = req.body;

            if (!email) {
                throw new BadRequest("Email is required");
            }

            await this.service.resendVerificationCode(email);

            res.status(200).json({message: "Verification code resent"});
        } catch (err) {
            next(err);
        }
    }

    async forgotPassword(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const {email} = req.body;

            if (!email) {
                throw new BadRequest("Email is required");
            }

            await this.service.requestPasswordReset(email);

            res.status(200).json({message: "Password reset code sent"});
        } catch (err) {
            next(err);
        }
    }

    async resetPassword(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const {email, code, newPassword} = req.body;

            if (!email || !code || !newPassword) {
                throw new BadRequest("Email, code and new password are required");
            }

            await this.service.resetPassword(email, code, newPassword);

            res.status(200).json({message: "Password reset successfully"});
        } catch (err) {
            next(err);
        }
    }

    async login(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const loginData: LoginDto = {
                email: req.body.email,
                password: req.body.password,
            };

            if (!loginData.email || !loginData.password) {
                throw new BadRequest("Email, password and is_oauth are required");
            }

            const user: Users | null = await this.service.getByEmailForAuth(
                loginData.email,
            );

            if (!user) {
                throw new Unauthorized("Invalid email or password");
            }

            if (user.password != null) {
                const isValid: boolean = await bcrypt.compare(
                    loginData.password,
                    user.password,
                );

                if (!isValid) {
                    throw new Unauthorized("Invalid email or password");
                }
            } else {
                throw new Unauthorized(
                    "User registered via OAuth, please login with the corresponding provider",
                );
            }

            if (!user.email_verified) {
                throw new Forbidden("EMAIL_NOT_VERIFIED");
            }

            if (user.twofa_enabled) {
                const preAuthToken: string = jwt.sign(
                    {id: user.id, twofa_pending: true},
                    process.env.JWT_SECRET!,
                    {expiresIn: "5m"},
                );

                res.json({
                    message: "Two-factor authentication required",
                    requires2FA: true,
                    preAuthToken,
                });
                return;
            }

            const token: string = this.signAuthToken(user);
            const userResponse: UserResponseLoginDto = userMapper.toLoginDto(user);

            res.json({
                message: "Login successful",
                token,
                user: userResponse,
            });
        } catch (err) {
            next(err);
        }
    }

    async verifyTwoFactorLogin(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const {preAuthToken, code} = req.body;

            if (!preAuthToken || !code) {
                throw new BadRequest("preAuthToken and code are required");
            }

            let decoded: any;
            try {
                decoded = jwt.verify(preAuthToken, process.env.JWT_SECRET!);
            } catch {
                throw new Unauthorized("Invalid or expired session, please log in again");
            }

            if (!decoded?.twofa_pending || !decoded?.id) {
                throw new Unauthorized("Invalid or expired session, please log in again");
            }

            const user = await this.service.verifyTwoFactorLogin(decoded.id, code);

            const token: string = this.signAuthToken(user);
            const userResponse: UserResponseLoginDto = userMapper.toLoginDto(user);

            res.json({
                message: "Login successful",
                token,
                user: userResponse,
            });
        } catch (err) {
            next(err);
        }
    }

    async setupTwoFactor(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const userId: string = (req as any).user.id;
            const result = await this.service.setupTwoFactor(userId);

            res.status(200).json({message: "Two-factor setup initiated", ...result});
        } catch (err) {
            next(err);
        }
    }

    async confirmTwoFactor(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const userId: string = (req as any).user.id;
            const {code} = req.body;

            if (!code) {
                throw new BadRequest("code is required");
            }

            const backupCodes: string[] = await this.service.confirmTwoFactor(userId, code);

            res.status(200).json({message: "Two-factor authentication enabled", backupCodes});
        } catch (err) {
            next(err);
        }
    }

    async regenerateBackupCodes(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const userId: string = (req as any).user.id;
            const {code} = req.body;

            if (!code) {
                throw new BadRequest("code is required");
            }

            const backupCodes: string[] = await this.service.regenerateBackupCodes(userId, code);

            res.status(200).json({message: "Backup codes regenerated", backupCodes});
        } catch (err) {
            next(err);
        }
    }

    async disableTwoFactor(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const userId: string = (req as any).user.id;
            const {code} = req.body;

            if (!code) {
                throw new BadRequest("code is required");
            }

            await this.service.disableTwoFactor(userId, code);

            res.status(200).json({message: "Two-factor authentication disabled"});
        } catch (err) {
            next(err);
        }
    }

    private signAuthToken(user: { id: string; email: string; username: string; role: unknown }): string {
        return jwt.sign(
            {
                id: user.id,
                email: user.email,
                username: user.username,
                role: user.role,
            },
            process.env.JWT_SECRET!,
            {expiresIn: "24h"},
        );
    }

    async getAll(_: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const users: UserResponseDto[] = await this.service.getAll();
            res.status(201).json({
                message: "All users retrieved",
                users,
            });
        } catch (err) {
            next(err);
        }
    }


    async getAllWithFields(
        req: Request,
        res: Response,
        next: NextFunction,
    ): Promise<void> {
        try {
            const fieldsParam = req.query.fields as string;

            if (!fieldsParam) {
                throw new BadRequest(
                    "Fields query parameter is required (e.g., ?fields=id,username,email)",
                );
            }

            const fields = fieldsParam
                .split(",")
                .map((field) => field.trim())
                .filter((field) => field.length > 0) as SelectableUserField[];

            if (fields.length === 0) {
                throw new BadRequest("At least one field must be specified");
            }

            const users: PartialUserResponseDto[] =
                await this.service.getAllWithFields(fields);

            res.json(users);
        } catch (err) {
            next(err);
        }
    }

    async getById(
        req: Request,
        res: Response,
        next: NextFunction,
    ): Promise<void> {
        try {
            if (!req.params.id) {
                throw new BadRequest("Id is required");
            }
            const user: UserResponseDto = await this.service.getById(req.params.id);
            res.status(201).json({
                message: "User retrieved successfully",
                user,
            });
        } catch (err) {
            next(err);
        }
    }


    async getByIdWithFields(
        req: Request,
        res: Response,
        next: NextFunction,
    ): Promise<void> {
        try {
            const id: string = req.params.id;

            if (!id) {
                throw new BadRequest("Id is required");
            }

            const fieldsParam = req.query.fields as string;

            if (!fieldsParam) {
                throw new BadRequest(
                    "Fields query parameter is required (e.g., ?fields=id,username,email)",
                );
            }

            const fields = fieldsParam
                .split(",")
                .map((field: string): string => field.trim())
                .filter((field: string): boolean => field.length > 0) as SelectableUserField[];

            if (fields.length === 0) {
                throw new BadRequest("At least one field must be specified");
            }

            const user: PartialUserResponseDto = await this.service.getByIdWithFields(
                id,
                fields,
            );

            res.status(200).json({
                message: "User field retrieved successfully",
                user,
            });
        } catch (err) {
            next(err);
        }
    }

    async update(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const id: string = req.params.id;

            if (!id) {
                throw new BadRequest("Id is required");
            }

            const updateData: UserUpdateDto = {};

            if (req.body.email !== undefined) {
                updateData.email = req.body.email;
            }

            if (req.body.username !== undefined) {
                updateData.username = req.body.username;
            }

            if (req.body.password !== undefined) {
                updateData.password = req.body.password;
                updateData.oldPassword = req.body.oldPassword;
            }

            if (req.body.phone_number !== undefined) {
                updateData.phone_number = req.body.phone_number;
            }

            if (req.body.biography !== undefined) {
                updateData.biography = req.body.biography;
            }

            if (req.body.pseudo !== undefined) {
                updateData.pseudo = req.body.pseudo;
            }

            if (req.body.favorite_band !== undefined) {
                updateData.favorite_band = req.body.favorite_band;
            }

            if (req.body.has_notifications !== undefined) {
                updateData.has_notifications = req.body.has_notifications;
            }

            if (req.body.profile_picture !== undefined) {
                updateData.profile_picture = req.body.profile_picture;
            }

            if (req.body.banner !== undefined) {
                updateData.banner = req.body.banner;
            }

            if (Object.keys(updateData).length === 0) {
                throw new BadRequest("No fields provided");
            }

            const user: UserResponseDto = await this.service.update(id, updateData);

            res.status(200).json({
                message: "User updated successfully",
                user,
            });
        } catch (err) {
            next(err);
        }
    }

    async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            if (!req.params.id) {
                throw new BadRequest("Id is required");
            }

            const user: UserResponseDeleteDto = await this.service.delete(
                req.params.id,
            );

            res.status(201).json({
                message: "User deleted successfully",
                user,
            });
        } catch (err) {
            next(err);
        }
    }

    async exportData(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const userId: string = (req as any).user.id;
            const data = await this.service.exportUserData(userId);

            res.setHeader(
                "Content-Disposition",
                `attachment; filename="melodia-export-${userId}.json"`,
            );
            res.status(200).json(data);
        } catch (err) {
            next(err);
        }
    }

    async search(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const query: string = (req.query.q as string) || "";
            const excludeUserId: string = (req as any).user.id;

            const users: UserSearchResultDto[] = await this.service.searchUsers(query, excludeUserId);

            res.status(200).json({users});
        } catch (err) {
            next(err);
        }
    }

    async getPublicProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const {id} = req.params;

            const user: UserPublicDto = await this.service.getProfile(id);

            res.status(200).json(user);
        } catch (err) {
            next(err);
        }
    }

    async updateProfile(
        req: Request,
        res: Response,
        next: NextFunction,
    ): Promise<void> {
        try {
            const userId: any = (req as any).user?.id;
            if (!userId) {
                throw new Unauthorized("User not authenticated");
            }

            const updateData: UserUpdateDto = {
                favorite_band: req.body.favorite_band,
                username: req.body.username,
                pseudo: req.body.pseudo,
                biography: req.body.biography,
                profile_picture: req.body.profile_picture,
                banner: req.body.banner,
            };

            const user: UserPublicDto = await this.service.updateProfile(userId, updateData);

            res.status(200).json({
                message: "Profile updated successfully",
                user,
            });
        } catch (err) {
            next(err);
        }
    }

    async updatePushToken(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const {user_id, token} = req.body;
            await userService.updatePushToken(user_id, token);
            res.status(200).json({message: "Push token updated successfully"});
        } catch (error) {
            next(error);
        }
    }

    async getCosmeticsCatalog(_req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const catalog = this.service.getCosmeticsCatalog();
            res.status(200).json({catalog});
        } catch (error) {
            next(error);
        }
    }

    async buyCosmetic(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const userId: any = (req as any).user?.id;
            if (!userId) {
                throw new Unauthorized("User not authenticated");
            }
            if (!req.body.cosmetic_id) {
                throw new BadRequest("cosmetic_id is required");
            }

            const result = await this.service.buyCosmetic(userId, req.body.cosmetic_id);

            res.status(200).json({
                message: "Cosmetic purchased successfully",
                ...result,
            });
        } catch (error) {
            next(error);
        }
    }

    async equipCosmetic(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const userId: any = (req as any).user?.id;
            if (!userId) {
                throw new Unauthorized("User not authenticated");
            }

            const requestedSlot: string = req.body.slot;
            if (!Object.keys(COSMETIC_SLOT_FIELDS).includes(requestedSlot)) {
                throw new BadRequest("Invalid cosmetic slot");
            }
            const slot: CosmeticSlot = requestedSlot as CosmeticSlot;

            const result = await this.service.equipCosmetic(
                userId,
                req.body.cosmetic_id ?? null,
                slot,
            );

            res.status(200).json({
                message: "Cosmetic equipped successfully",
                ...result,
            });
        } catch (error) {
            next(error);
        }
    }
}

export default new UserController();
